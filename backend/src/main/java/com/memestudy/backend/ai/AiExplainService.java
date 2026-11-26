package com.memestudy.backend.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.models.beta.messages.BetaMessage;
import com.anthropic.models.beta.messages.BetaOutputConfig;
import com.anthropic.models.beta.messages.BetaStopReason;
import com.anthropic.models.beta.messages.MessageCreateParams;
import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.memestudy.backend.model.ChoiceDto;
import com.memestudy.backend.model.QuestionDto;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI basic — giải thích vì sao học sinh chọn sai một câu trắc nghiệm.
 *
 * <p>Hỗ trợ 2 nhà cung cấp, chọn theo API key đặt ở biến môi trường của backend:
 * <ul>
 *   <li>Mỗi giá trị đọc từ biến môi trường, nếu không có thì từ file {@code backend/ai.local.properties} (gitignored).</li>
 *   <li><b>Gemini</b> (Google): {@code GOOGLE_API_KEY} hoặc {@code GEMINI_API_KEY}; model {@code GEMINI_MODEL}.</li>
 *   <li><b>Claude</b> (Anthropic): {@code ANTHROPIC_API_KEY}; model {@code ANTHROPIC_MODEL}.</li>
 *   <li>Có cả hai → mặc định Gemini; ép chọn bằng {@code AI_PROVIDER=gemini|claude}.</li>
 * </ul>
 *
 * <p>Nguyên tắc chung:
 * <ul>
 *   <li>API key chỉ nằm ở backend, app không bao giờ thấy key.</li>
 *   <li>Câu hỏi + đáp án đúng lấy từ dữ liệu của server, không tin dữ liệu app gửi lên.</li>
 *   <li>Cache theo (nhà cung cấp, câu hỏi, đáp án đã chọn) để không gọi lại AI cho cùng một lỗi sai.</li>
 *   <li>Chưa có key hoặc AI lỗi → trả lời giải có sẵn trong database (source = "fallback").</li>
 * </ul>
 */
public final class AiExplainService {

    public enum Provider { GEMINI, CLAUDE }

    static final String DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
    private static final String DEFAULT_CLAUDE_MODEL = "claude-opus-5-5";
    /** Claude: bật dự phòng phía server khi model từ chối trả lời (refusal). */
    private static final String CLAUDE_FALLBACK_BETA = "server-side-fallback-2026-07-01";

    private static final String SYSTEM_PROMPT = String.join("\n",
            "Bạn là Cú MeMe, gia sư tiếng Anh thân thiện của học sinh tiểu học Việt Nam.",
            "Học sinh vừa trả lời SAI hoặc BỎ TRỐNG một câu trắc nghiệm. Hãy giải thích bằng tiếng Việt, giọng ấm áp, dễ hiểu:",
            "1. Nếu học sinh đã chọn: vì sao đáp án đó chưa đúng. Nếu học sinh bỏ trống: nhắc nhẹ lần sau nên chọn một đáp án.",
            "2. Vì sao đáp án đúng là đúng (nêu quy tắc hoặc nghĩa của từ).",
            "3. Một mẹo ngắn để lần sau nhớ.",
            "Tuyệt đối không khen là học sinh đã trả lời đúng.",
            "Viết tối đa 4 câu ngắn, dưới 90 từ, không dùng markdown, không dùng tiêu đề hay gạch đầu dòng.",
            "Chỉ dựa vào câu hỏi và đáp án được cung cấp; không bịa thêm thông tin.");

    private static final Map<String, Explanation> CACHE = new ConcurrentHashMap<>();
    private static volatile AnthropicClient claudeClient;
    private static volatile Client geminiClient;
    private static volatile Properties localProps;

    /** File cấu hình cục bộ chứa API key (KHÔNG commit). */
    private static final String LOCAL_CONFIG_FILE = "ai.local.properties";

    private AiExplainService() {
    }

    /** Kết quả trả về cho app. */
    public static final class Explanation {
        private final String explanation;
        private final String source; // "ai" | "fallback"
        private final String provider; // "gemini" | "claude" | null
        private final String notice;

        Explanation(String explanation, String source, String provider, String notice) {
            this.explanation = explanation;
            this.source = source;
            this.provider = provider;
            this.notice = notice;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("explanation", explanation);
            m.put("source", source);
            if (provider != null) m.put("provider", provider);
            if (notice != null) m.put("notice", notice);
            return m;
        }
    }

    /** Nhà cung cấp đang dùng, hoặc null nếu chưa đặt API key nào. */
    public static Provider activeProvider() {
        boolean hasGemini = geminiKey() != null;
        boolean hasClaude = hasText(config("ANTHROPIC_API_KEY"));
        String forced = config("AI_PROVIDER");
        if ("claude".equalsIgnoreCase(forced) && hasClaude) return Provider.CLAUDE;
        if ("gemini".equalsIgnoreCase(forced) && hasGemini) return Provider.GEMINI;
        if (hasGemini) return Provider.GEMINI;
        if (hasClaude) return Provider.CLAUDE;
        return null;
    }

    public static boolean isConfigured() {
        return activeProvider() != null;
    }

    public static Explanation explain(QuestionDto question, Integer selectedChoiceId) {
        Provider provider = activeProvider();
        if (provider == null) {
            return fallback(question,
                    "Máy chủ chưa bật AI (thiếu GOOGLE_API_KEY hoặc ANTHROPIC_API_KEY) — đây là lời giải có sẵn.");
        }

        // Đáp án gửi lên đã đúng → không cần (và không nên) gọi AI.
        if (selectedChoiceId != null && selectedChoiceId.equals(question.getCorrectChoiceId())) {
            return new Explanation("Bạn đã chọn đúng đáp án rồi, giỏi lắm! "
                    + (question.getExplanation() != null ? question.getExplanation() : ""), "fallback", null,
                    "Câu này bạn làm đúng nên không cần hỏi AI.");
        }

        String cacheKey = provider + ":" + question.getId() + ":" + selectedChoiceId;
        Explanation cached = CACHE.get(cacheKey);
        if (cached != null) return cached;

        String userPrompt = buildUserPrompt(question, selectedChoiceId);
        try {
            String text = provider == Provider.GEMINI ? askGemini(userPrompt) : askClaude(userPrompt);
            if (text == null || text.isBlank()) {
                return fallback(question, "AI chưa trả lời được câu này — đây là lời giải có sẵn.");
            }
            Explanation result = new Explanation(text.trim(), "ai", provider.name().toLowerCase(), null);
            CACHE.put(cacheKey, result);
            return result;
        } catch (ApiException e) {
            // Lỗi từ Gemini API (429 = hết lượt miễn phí / quá tải, 400/403 = key hoặc model sai...)
            System.err.println("[AI] Gemini API error " + e.code() + ": " + e.getMessage());
            return fallback(question, e.code() == 429
                    ? "AI đang hết lượt hoặc quá tải, bạn thử lại sau ít phút nhé — đây là lời giải có sẵn."
                    : "AI tạm thời gặp lỗi — đây là lời giải có sẵn.");
        } catch (RateLimitException e) {
            return fallback(question, "AI đang quá tải, bạn thử lại sau ít phút nhé — đây là lời giải có sẵn.");
        } catch (AnthropicServiceException e) {
            System.err.println("[AI] Claude API error " + e.statusCode() + ": " + e.getMessage());
            return fallback(question, "AI tạm thời gặp lỗi — đây là lời giải có sẵn.");
        } catch (RuntimeException e) {
            // Lỗi mạng / timeout / cấu hình
            System.err.println("[AI] Request failed: " + e);
            return fallback(question, "Không kết nối được AI — đây là lời giải có sẵn.");
        }
    }

    // ---------------------------------------------------------------- Gemini

    private static String askGemini(String userPrompt) {
        String model = envOrDefault("GEMINI_MODEL", DEFAULT_GEMINI_MODEL);
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_PROMPT)))
                .build();
        GenerateContentResponse response = getGeminiClient().models.generateContent(model, userPrompt, config);
        return response.text();
    }

    static Client getGeminiClient() {
        Client c = geminiClient;
        if (c == null) {
            synchronized (AiExplainService.class) {
                c = geminiClient;
                if (c == null) {
                    c = Client.builder().apiKey(geminiKey()).build();
                    geminiClient = c;
                }
            }
        }
        return c;
    }

    /** SDK Google ưu tiên GOOGLE_API_KEY; GEMINI_API_KEY là tên cũ vẫn được hỗ trợ. */
    static String geminiKey() {
        String google = config("GOOGLE_API_KEY");
        if (hasText(google)) return google;
        String gemini = config("GEMINI_API_KEY");
        return hasText(gemini) ? gemini : null;
    }

    // ---------------------------------------------------------------- Claude

    private static String askClaude(String userPrompt) {
        MessageCreateParams params = MessageCreateParams.builder()
                .model(envOrDefault("ANTHROPIC_MODEL", DEFAULT_CLAUDE_MODEL))
                .maxTokens(16000L)
                .system(SYSTEM_PROMPT)
                .addUserMessage(userPrompt)
                // Việc đơn giản → effort thấp cho nhanh và rẻ.
                .outputConfig(BetaOutputConfig.builder().effort(BetaOutputConfig.Effort.LOW).build())
                // Nếu model từ chối (refusal), server tự chuyển sang model dự phòng phù hợp.
                .addBeta(CLAUDE_FALLBACK_BETA)
                .putAdditionalBodyProperty("fallbacks", JsonValue.from("default"))
                .build();

        BetaMessage response = getClaudeClient().beta().messages().create(params);

        boolean refused = response.stopReason().map(r -> r.equals(BetaStopReason.REFUSAL)).orElse(false);
        if (refused) return null;

        StringBuilder sb = new StringBuilder();
        response.content().forEach(block -> block.text().ifPresent(t -> sb.append(t.text())));
        return sb.toString();
    }

    private static AnthropicClient getClaudeClient() {
        AnthropicClient c = claudeClient;
        if (c == null) {
            synchronized (AiExplainService.class) {
                c = claudeClient;
                if (c == null) {
                    // Key lấy từ biến môi trường hoặc ai.local.properties.
                    c = AnthropicOkHttpClient.builder()
                            .apiKey(config("ANTHROPIC_API_KEY"))
                            .timeout(Duration.ofSeconds(40))
                            .build();
                    claudeClient = c;
                }
            }
        }
        return c;
    }

    // ---------------------------------------------------------------- Prompt & dự phòng

    private static String buildUserPrompt(QuestionDto q, Integer selectedChoiceId) {
        List<ChoiceDto> choices = q.getChoices();
        StringBuilder sb = new StringBuilder();
        sb.append("Câu hỏi: ").append(q.getContent()).append('\n');
        sb.append("Các lựa chọn:\n");
        String selected = null;
        String correct = null;
        for (int i = 0; i < choices.size(); i++) {
            ChoiceDto c = choices.get(i);
            char letter = (char) ('A' + i);
            sb.append(letter).append(". ").append(c.getContent()).append('\n');
            if (selectedChoiceId != null && c.getId() == selectedChoiceId) selected = letter + ". " + c.getContent();
            if (q.getCorrectChoiceId() != null && c.getId() == q.getCorrectChoiceId()) correct = letter + ". " + c.getContent();
        }
        if (correct == null && q.getCorrectIndex() != null && q.getCorrectIndex() < choices.size()) {
            int i = q.getCorrectIndex();
            correct = (char) ('A' + i) + ". " + choices.get(i).getContent();
        }
        sb.append("Học sinh chọn: ").append(selected != null
                ? selected + " (SAI)"
                : "(bỏ trống — học sinh không chọn đáp án nào, nên câu này bị tính sai)").append('\n');
        sb.append("Đáp án đúng: ").append(correct != null ? correct : "(không rõ)").append('\n');
        if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
            sb.append("Lời giải tham khảo của giáo viên: ").append(q.getExplanation()).append('\n');
        }
        return sb.toString();
    }

    private static Explanation fallback(QuestionDto q, String notice) {
        String text = q.getExplanation() != null && !q.getExplanation().isBlank()
                ? q.getExplanation()
                : "Hãy xem lại đáp án đúng và đọc kỹ câu hỏi nhé!";
        return new Explanation(text, "fallback", null, notice);
    }

    static String envOrDefault(String name, String defaultValue) {
        String v = config(name);
        return hasText(v) ? v : defaultValue;
    }

    /**
     * Đọc cấu hình AI: ưu tiên biến môi trường, sau đó tới file {@code ai.local.properties}
     * (đặt trong thư mục backend/, đã nằm trong .gitignore → key không bao giờ lên GitHub).
     */
    private static String config(String name) {
        String env = System.getenv(name);
        if (hasText(env)) return env.trim();
        String fromFile = localProperties().getProperty(name);
        return hasText(fromFile) ? fromFile.trim() : null;
    }

    private static Properties localProperties() {
        Properties p = localProps;
        if (p == null) {
            synchronized (AiExplainService.class) {
                p = localProps;
                if (p == null) {
                    p = new Properties();
                    String dir = System.getProperty("user.dir");
                    // Chạy từ backend/ (IntelliJ, mvn exec:java) hoặc từ thư mục gốc repo.
                    for (Path file : List.of(Paths.get(dir, LOCAL_CONFIG_FILE), Paths.get(dir, "backend", LOCAL_CONFIG_FILE))) {
                        if (Files.isRegularFile(file)) {
                            try (Reader r = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                                p.load(r);
                                System.out.println("[AI] Loaded AI config from " + file.toAbsolutePath());
                            } catch (IOException e) {
                                System.err.println("[AI] Cannot read " + file + ": " + e.getMessage());
                            }
                            break;
                        }
                    }
                    localProps = p;
                }
            }
        }
        return p;
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}

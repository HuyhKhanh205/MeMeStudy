package com.memestudy.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.errors.ApiException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.Part;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * AI basic — tải đề lên: Gemini đọc file đề (PDF, Word .docx, ảnh chụp, .txt) và tách thành câu hỏi trắc nghiệm.
 *
 * Luồng: app gửi file (base64) → {@link #parse} → Gemini trả JSON đúng khuôn (structured output)
 * → backend làm sạch dữ liệu → trả "bản nháp" để giáo viên xem lại. Chưa ghi gì vào database
 * cho tới khi giáo viên bấm "Tạo bài kiểm tra" (POST /api/exams).
 *
 * - PDF và ảnh: gửi thẳng file cho Gemini (Gemini đọc được PDF/ảnh).
 * - DOCX: Gemini không nhận file Word → backend tự giải nén word/document.xml lấy chữ;
 *   chữ in đậm/gạch chân/tô màu nền được bọc **...** vì đề thường đánh dấu đáp án đúng như vậy.
 */
public final class ExamImportService {

    /** File tối đa 8 MB (base64 ~10.7 triệu ký tự, vẫn dưới giới hạn của Jackson và Gemini). */
    public static final int MAX_FILE_BYTES = 8 * 1024 * 1024;
    public static final int MAX_QUESTIONS = 50;
    private static final int MAX_DOCX_CHARS = 120_000;
    private static final int GEMINI_TIMEOUT_MS = 120_000;

    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String SYSTEM_PROMPT = String.join("\n",
            "Bạn là trợ lý của giáo viên tiếng Anh tiểu học trong ứng dụng MeMeStudy.",
            "Nhiệm vụ: đọc tài liệu đề kiểm tra và trích xuất các câu hỏi TRẮC NGHIỆM (2–4 lựa chọn, 1 đáp án đúng).",
            "Quy tắc:",
            "- Giữ nguyên nội dung câu hỏi và các lựa chọn như trong tài liệu; không dịch, không bịa thêm câu hỏi.",
            "- Bỏ số thứ tự câu (\"Câu 1.\", \"1)\", \"Question 1:\") ở đầu câu hỏi và bỏ chữ cái A./B./C./D. ở đầu lựa chọn.",
            "- Nếu tài liệu cho biết đáp án (bảng đáp án cuối đề, chữ được đánh dấu **như thế này**, dấu *, khoanh tròn...)"
                    + " thì dùng đáp án đó và đặt answerFromDocument = true.",
            "- Nếu tài liệu không có đáp án, hãy tự giải và đặt answerFromDocument = false để giáo viên kiểm tra lại.",
            "- correctIndex tính từ 0 (A = 0, B = 1, C = 2, D = 3).",
            "- explanation: 1–2 câu tiếng Việt ngắn gọn, dễ hiểu với học sinh tiểu học, giải thích vì sao đáp án đúng.",
            "- Bỏ qua câu tự luận, câu nối, câu điền từ không có lựa chọn, và các phần hướng dẫn.",
            "- Với câu cần nghe (listening) hoặc cần nhìn hình mà tài liệu không có đủ thông tin thì bỏ qua.",
            "- Tối đa " + MAX_QUESTIONS + " câu.",
            "- title: tên đề trong tài liệu; nếu không có thì tự đặt tên ngắn gọn bằng tiếng Việt.",
            "- Nếu tài liệu không phải đề kiểm tra thì trả về questions là mảng rỗng.");

    private ExamImportService() {
    }

    /** Lỗi có mã HTTP + thông báo tiếng Việt để trả thẳng cho app. */
    public static final class ImportException extends RuntimeException {
        private final int status;

        public ImportException(int status, String message) {
            super(message);
            this.status = status;
        }

        public int getStatus() {
            return status;
        }
    }

    /** Một câu hỏi trong bản nháp (cũng là khuôn dữ liệu app gửi lại khi tạo đề). */
    public static final class DraftQuestion {
        private String content;
        private List<String> choices;
        private Integer correctIndex;
        private String explanation;
        private Boolean answerFromDocument;

        public DraftQuestion() {
        }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public List<String> getChoices() { return choices; }
        public void setChoices(List<String> choices) { this.choices = choices; }
        public Integer getCorrectIndex() { return correctIndex; }
        public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public Boolean getAnswerFromDocument() { return answerFromDocument; }
        public void setAnswerFromDocument(Boolean answerFromDocument) { this.answerFromDocument = answerFromDocument; }
    }

    /**
     * Đọc file đề bằng Gemini.
     *
     * @return { title, questions: [DraftQuestion...], warnings: [..], provider: "gemini", model }
     */
    public static Map<String, Object> parse(String fileName, String mimeType, byte[] data) {
        if (AiExplainService.geminiKey() == null) {
            throw new ImportException(503,
                    "Máy chủ chưa bật Gemini (thiếu GOOGLE_API_KEY trong backend/ai.local.properties) nên chưa đọc đề được.");
        }
        if (data == null || data.length == 0) {
            throw new ImportException(400, "File rỗng.");
        }
        if (data.length > MAX_FILE_BYTES) {
            throw new ImportException(413, "File quá lớn (tối đa 8 MB).");
        }

        String kind = detectKind(fileName, mimeType);
        List<Part> parts = new ArrayList<>();
        switch (kind) {
            case "pdf" -> parts.add(Part.fromBytes(data, "application/pdf"));
            case "png" -> parts.add(Part.fromBytes(data, "image/png"));
            case "jpeg" -> parts.add(Part.fromBytes(data, "image/jpeg"));
            case "webp" -> parts.add(Part.fromBytes(data, "image/webp"));
            case "docx" -> parts.add(Part.fromText("Nội dung file Word \"" + safeName(fileName) + "\""
                    + " (chữ được bọc **...** là chữ in đậm / gạch chân / tô màu trong file gốc):\n\n"
                    + extractDocxText(data)));
            case "txt" -> parts.add(Part.fromText("Nội dung file \"" + safeName(fileName) + "\":\n\n"
                    + new String(data, StandardCharsets.UTF_8)));
            case "doc" -> throw new ImportException(415,
                    "File Word đời cũ (.doc) chưa hỗ trợ. Hãy mở file và lưu lại dạng .docx hoặc PDF rồi tải lên.");
            default -> throw new ImportException(415,
                    "Chỉ hỗ trợ file PDF, Word (.docx), ảnh chụp đề (JPG/PNG) hoặc .txt.");
        }
        parts.add(Part.fromText("Hãy trích xuất các câu hỏi trắc nghiệm trong tài liệu trên theo đúng khuôn JSON."));

        String model = AiExplainService.envOrDefault("GEMINI_MODEL", AiExplainService.DEFAULT_GEMINI_MODEL);
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_PROMPT)))
                .responseMimeType("application/json")
                .responseJsonSchema(responseSchema())
                .temperature(0.2f)
                .httpOptions(HttpOptions.builder().timeout(GEMINI_TIMEOUT_MS).build())
                .build();

        String raw;
        long started = System.currentTimeMillis();
        try {
            GenerateContentResponse response = AiExplainService.getGeminiClient().models.generateContent(
                    model, Content.fromParts(parts.toArray(new Part[0])), config);
            raw = response.text();
        } catch (ApiException e) {
            System.err.println("[AI] Gemini import error " + e.code() + ": " + e.getMessage());
            throw new ImportException(e.code() == 429 ? 429 : 502, e.code() == 429
                    ? "Gemini đang hết lượt hoặc quá tải, thử lại sau ít phút nhé."
                    : "Gemini không đọc được file này (lỗi " + e.code() + "). Thử file khác hoặc lưu lại dạng PDF.");
        } catch (RuntimeException e) {
            System.err.println("[AI] Gemini import failed: " + e);
            throw new ImportException(502, "Không kết nối được Gemini (mạng chậm hoặc file quá dài). Thử lại nhé.");
        }
        System.out.println("[AI] Gemini đọc đề \"" + safeName(fileName) + "\" (" + kind + ", "
                + data.length / 1024 + " KB) trong " + (System.currentTimeMillis() - started) + " ms");

        return normalize(raw);
    }

    // ---------------------------------------------------------------- Làm sạch kết quả của AI

    private static final Pattern CHOICE_PREFIX = Pattern.compile("^\\s*[\\(\\[]?[A-Da-d][\\.\\)\\]:]\\s+");
    private static final Pattern QUESTION_PREFIX = Pattern.compile(
            "^\\s*(?:(?:Câu|Question|Q)\\s*)?\\d{1,3}\\s*[\\.\\):]\\s*", Pattern.CASE_INSENSITIVE);

    static Map<String, Object> normalize(String raw) {
        JsonNode root;
        try {
            root = JSON.readTree(raw == null ? "" : raw);
        } catch (IOException e) {
            throw new ImportException(502, "Gemini trả kết quả không đúng định dạng. Thử lại nhé.");
        }
        if (root == null || !root.isObject()) {
            throw new ImportException(502, "Gemini trả kết quả không đúng định dạng. Thử lại nhé.");
        }

        List<String> warnings = new ArrayList<>();
        List<DraftQuestion> questions = new ArrayList<>();
        int skipped = 0;
        int aiAnswered = 0;
        for (JsonNode q : root.path("questions")) {
            String content = clip(QUESTION_PREFIX.matcher(q.path("content").asText("").trim()).replaceFirst(""), 1000);
            List<String> choices = new ArrayList<>();
            for (JsonNode c : q.path("choices")) {
                String text = clip(CHOICE_PREFIX.matcher(c.asText("").trim()).replaceFirst("").trim(), 500);
                if (!text.isEmpty() && choices.size() < 4) choices.add(text);
            }
            if (content.isEmpty() || choices.size() < 2) {
                skipped++;
                continue;
            }
            int correct = q.path("correctIndex").asInt(-1);
            boolean fromDoc = q.path("answerFromDocument").asBoolean(false);
            if (correct < 0 || correct >= choices.size()) {
                correct = 0;
                fromDoc = false;
            }
            if (!fromDoc) aiAnswered++;

            DraftQuestion d = new DraftQuestion();
            d.setContent(content);
            d.setChoices(choices);
            d.setCorrectIndex(correct);
            d.setExplanation(clip(q.path("explanation").asText("").trim(), 1000));
            d.setAnswerFromDocument(fromDoc);
            questions.add(d);
            if (questions.size() >= MAX_QUESTIONS) break;
        }

        if (questions.isEmpty()) {
            throw new ImportException(422,
                    "Không tìm thấy câu hỏi trắc nghiệm nào trong file. Hãy kiểm tra file có câu hỏi kèm các lựa chọn A, B, C, D.");
        }
        if (skipped > 0) {
            warnings.add("Đã bỏ " + skipped + " câu thiếu nội dung hoặc có ít hơn 2 lựa chọn.");
        }
        if (aiAnswered > 0) {
            warnings.add(aiAnswered + " câu không có đáp án trong file — Gemini tự giải, hãy kiểm tra lại các câu được đánh dấu.");
        }

        String title = clip(root.path("title").asText("").trim(), 180);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", title.isEmpty() ? "Đề kiểm tra mới" : title);
        result.put("questions", questions);
        result.put("warnings", warnings);
        result.put("provider", "gemini");
        return result;
    }

    /** Khuôn JSON bắt Gemini trả về (structured output). */
    private static Map<String, Object> responseSchema() {
        Map<String, Object> question = Map.of(
                "type", "object",
                "properties", Map.of(
                        "content", Map.of("type", "string", "description", "Nội dung câu hỏi"),
                        "choices", Map.of("type", "array", "items", Map.of("type", "string"),
                                "description", "Các lựa chọn theo thứ tự A, B, C, D (2–4 lựa chọn)"),
                        "correctIndex", Map.of("type", "integer", "description", "Vị trí đáp án đúng, tính từ 0"),
                        "answerFromDocument", Map.of("type", "boolean",
                                "description", "true nếu đáp án lấy từ tài liệu, false nếu AI tự giải"),
                        "explanation", Map.of("type", "string", "description", "Giải thích ngắn bằng tiếng Việt")),
                "required", List.of("content", "choices", "correctIndex", "answerFromDocument", "explanation"));
        return Map.of(
                "type", "object",
                "properties", Map.of(
                        "title", Map.of("type", "string", "description", "Tên đề kiểm tra"),
                        "questions", Map.of("type", "array", "items", question)),
                "required", List.of("title", "questions"));
    }

    // ---------------------------------------------------------------- Đọc file

    static String detectKind(String fileName, String mimeType) {
        String name = fileName == null ? "" : fileName.toLowerCase(Locale.ROOT).trim();
        String mime = mimeType == null ? "" : mimeType.toLowerCase(Locale.ROOT).trim();
        if (name.endsWith(".pdf") || mime.equals("application/pdf")) return "pdf";
        if (name.endsWith(".docx") || mime.contains("wordprocessingml")) return "docx";
        if (name.endsWith(".doc") || mime.equals("application/msword")) return "doc";
        if (name.endsWith(".png") || mime.equals("image/png")) return "png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg") || mime.equals("image/jpeg")) return "jpeg";
        if (name.endsWith(".webp") || mime.equals("image/webp")) return "webp";
        if (name.endsWith(".txt") || mime.startsWith("text/plain")) return "txt";
        return "unknown";
    }

    private static final Pattern PARAGRAPH = Pattern.compile("<w:p(?:\\s[^>]*)?>(.*?)</w:p>", Pattern.DOTALL);
    private static final Pattern RUN = Pattern.compile("<w:r(?:\\s[^>]*)?>(.*?)</w:r>", Pattern.DOTALL);
    private static final Pattern RUN_PROPS = Pattern.compile("<w:rPr>(.*?)</w:rPr>", Pattern.DOTALL);
    private static final Pattern TEXT = Pattern.compile("<w:t(?:\\s[^>]*)?>(.*?)</w:t>|<w:tab/>|<w:br/>", Pattern.DOTALL);
    private static final Pattern EMPHASIS = Pattern.compile(
            "<w:b/>|<w:b w:val=\"(?:1|true|on)\"/>|<w:u w:val=\"(?!none)[^\"]+\"/>|<w:highlight w:val=\"(?!none)[^\"]+\"/>"
                    + "|<w:shd [^>]*w:fill=\"(?!auto|FFFFFF|ffffff)[0-9A-Fa-f]{6}\"");

    /** Lấy chữ từ file .docx (file zip chứa word/document.xml) — không cần thư viện ngoài. */
    static String extractDocxText(byte[] data) {
        String xml = null;
        try (ZipInputStream zip = new ZipInputStream(new java.io.ByteArrayInputStream(data))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] buf = new byte[8192];
                    int n;
                    long total = 0;
                    while ((n = zip.read(buf)) > 0) {
                        total += n;
                        if (total > 50L * 1024 * 1024) throw new ImportException(413, "File Word quá lớn.");
                        out.write(buf, 0, n);
                    }
                    xml = out.toString(StandardCharsets.UTF_8);
                    break;
                }
            }
        } catch (IOException e) {
            throw new ImportException(400, "Không mở được file Word. Hãy kiểm tra file có đúng định dạng .docx.");
        }
        if (xml == null) {
            throw new ImportException(400, "File không phải Word .docx hợp lệ.");
        }

        StringBuilder sb = new StringBuilder();
        Matcher p = PARAGRAPH.matcher(xml);
        while (p.find()) {
            Matcher r = RUN.matcher(p.group(1));
            while (r.find()) {
                String run = r.group(1);
                Matcher props = RUN_PROPS.matcher(run);
                boolean emphasized = props.find() && EMPHASIS.matcher(props.group(1)).find();
                StringBuilder text = new StringBuilder();
                Matcher t = TEXT.matcher(run);
                while (t.find()) {
                    if (t.group(1) != null) text.append(unescapeXml(t.group(1)));
                    else if (t.group().startsWith("<w:tab")) text.append('\t');
                    else text.append('\n');
                }
                if (text.length() == 0) continue;
                if (emphasized && !text.toString().isBlank()) sb.append("**").append(text).append("**");
                else sb.append(text);
            }
            sb.append('\n');
            if (sb.length() > MAX_DOCX_CHARS) break;
        }
        String result = sb.toString().replace("****", "").replaceAll("\n{3,}", "\n\n").trim();
        if (result.isEmpty()) {
            throw new ImportException(422, "File Word không có chữ (có thể đề là ảnh dán vào Word — hãy xuất ra PDF rồi tải lên).");
        }
        return result.length() > MAX_DOCX_CHARS ? result.substring(0, MAX_DOCX_CHARS) : result;
    }

    private static String unescapeXml(String s) {
        return s.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"")
                .replace("&apos;", "'").replace("&amp;", "&");
    }

    private static String clip(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }

    private static String safeName(String fileName) {
        if (fileName == null) return "đề";
        String clean = fileName.replaceAll("[\\r\\n\"]", " ").trim();
        return clip(clean.isEmpty() ? "đề" : clean, 120);
    }
}

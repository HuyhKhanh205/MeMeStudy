# AI basic — Cú AI giải thích câu sai

> Yêu cầu đề: **AI basic**. Chức năng: ở màn **Kết quả**, mỗi câu học sinh làm sai có nút **"Hỏi Cú AI vì sao sai?"**. Cú MeMe giải thích bằng tiếng Việt vì sao lựa chọn của học sinh chưa đúng, vì sao đáp án đúng là đúng, kèm một mẹo ghi nhớ. Backend dùng **Gemini (Google)** hoặc **Claude (Anthropic)** — tuỳ API key được đặt.

## 1. Luồng hoạt động

```
App (ResultScreen)                Backend Java (Tomcat)                        AI
AiExplainBox ── RTK Query ──▶ POST /api/ai/explain ──┬─ Google GenAI SDK ──▶ Gemini (gemini-3.6-flash)
  { questionId, selectedChoiceId }   │               └─ Anthropic SDK ─────▶ Claude (claude-opus-5-5)
                                     │ lấy câu hỏi + đáp án đúng từ InMemoryStore/MariaDB
                                     │ cache theo (nhà cung cấp, câu hỏi, đáp án đã chọn)
                                ◀── { explanation, source: "ai" | "fallback", provider?, notice? }
```

- **Chọn nhà cung cấp theo key** đặt ở biến môi trường của backend: có `GOOGLE_API_KEY` (hoặc tên cũ `GEMINI_API_KEY`) → Gemini; có `ANTHROPIC_API_KEY` → Claude; có cả hai → Gemini (ép chọn bằng `AI_PROVIDER=gemini|claude`); không có key nào → dùng lời giải có sẵn.
- **API key chỉ nằm ở backend**. App không bao giờ chứa key (`EXPO_PUBLIC_*` sẽ lộ trong bundle).
- App **chỉ gửi mã câu hỏi và mã đáp án đã chọn**; nội dung câu hỏi và đáp án đúng do server tự lấy → học sinh không thể sửa dữ liệu để "lừa" AI.
- **Bắt buộc đăng nhập** (JWT) để hạn chế lạm dụng lượt gọi AI.
- **Cache**: cùng một câu + cùng một đáp án sai chỉ gọi AI một lần.
- **Dự phòng**: chưa có key / hết lượt miễn phí (429) / key sai / lỗi mạng → trả **lời giải có sẵn** trong database kèm ghi chú (`source: "fallback"`). App không bao giờ bị "trắng".
- Claude: bật dự phòng khi model từ chối trả lời (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) và `effort: low` cho nhanh, rẻ.

## 2. File liên quan

| Phần | File |
| --- | --- |
| Chọn nhà cung cấp, prompt, gọi Gemini/Claude, cache, dự phòng | `backend/src/main/java/com/memestudy/backend/ai/AiExplainService.java` |
| API `POST /api/ai/explain`, `GET /api/ai/status` | `backend/src/main/java/com/memestudy/backend/resource/AiResource.java` |
| Thư viện | `backend/pom.xml`: `com.google.genai:google-genai:2.6.0`, `com.anthropic:anthropic-java:3.3.0` |
| Kiểu dữ liệu | `frontend/src/types/ai.ts` |
| Service (axios, timeout 45s) | `frontend/src/services/aiService.ts` |
| Mock (không cần backend) | `frontend/src/services/mock/index.ts` → `aiExplain` |
| RTK Query mutation | `frontend/src/store/api.ts` → `useExplainAnswerMutation` |
| Giao diện (nút, "đang suy nghĩ", kết quả + nhãn Gemini/Claude, lỗi) | `frontend/src/components/AiExplainBox.tsx`, dùng trong `screens/user/ResultScreen.tsx` |

## 3. Cách bật AI bằng Gemini (khuyên dùng — có gói miễn phí)

1. Vào **Google AI Studio** → *Get API key* → tạo key. **Không** gửi key qua chat/Zalo, **không** commit lên GitHub, không đặt vào `frontend/.env`. Nếu key đã lỡ lộ: xoá key đó trong AI Studio và tạo key mới.
2. Đặt key cho backend rồi chạy lại backend — **cách khuyên dùng**: mở file `backend/ai.local.properties` (nếu chưa có thì sao chép từ `backend/ai.local.properties.example`), dán key ngay sau `GOOGLE_API_KEY=`, lưu file. File này **đã nằm trong `.gitignore`** nên key không bao giờ bị đẩy lên GitHub. Khi chạy, log backend có dòng `[AI] Loaded AI config from ...`.
   - Cách khác: biến môi trường `GOOGLE_API_KEY` (được ưu tiên hơn file). **Không** đặt trong Environment variables của run configuration IntelliJ ở repo này, vì `backend/.idea/workspace.xml` đang được commit lên GitHub → key có thể bị lộ theo.
3. Kiểm tra: mở `http://localhost:8080/api/ai/status` → `{"data":{"enabled":true,"provider":"gemini"}}`.
4. App: đặt `EXPO_PUBLIC_USE_MOCK=false` trong `frontend/.env` (điện thoại thật: `EXPO_PUBLIC_API_URL=http://<IP-LAN>:8080/api`), chạy lại `npx expo start -c`, làm một bài, vào **Kết quả → Câu cần ôn lại** → bấm **"Hỏi Cú AI vì sao sai?"**. Nhãn **"Gemini AI"** = câu trả lời do AI tạo; **"Lời giải có sẵn"** = đang dùng dự phòng (đọc ghi chú dưới hộp; log backend có dòng `[AI] ...` cho biết lý do).
5. Tuỳ chọn: đổi model bằng `GEMINI_MODEL` (mặc định `gemini-3.6-flash`, bản ổn định; `gemini-2.5-flash` đã bị ngừng). Gói miễn phí có giới hạn lượt/phút và lượt/ngày; ở gói miễn phí Google có thể dùng dữ liệu gửi lên để cải thiện sản phẩm — ở đây chỉ gửi nội dung câu hỏi trắc nghiệm, không có thông tin cá nhân.

**Dùng Claude thay Gemini**: đặt `ANTHROPIC_API_KEY` (tạo tại console.anthropic.com) thay cho `GOOGLE_API_KEY`; status sẽ báo `"provider":"claude"`, nhãn trên app là "Claude AI".

## 4. Đã kiểm tra (25/11/2026)

- Backend biên dịch (`mvn compile`) và chạy được với cả 2 SDK cùng lúc (không xung đột thư viện).
- Không có key → `GET /api/ai/status` báo `enabled: false`; `POST /api/ai/explain` trả lời giải có sẵn + ghi chú.
- Backend đọc được key từ `backend/ai.local.properties` (đã kiểm tra bằng key giả; `git check-ignore` xác nhận file không bị commit).
- Đặt một key Gemini **giả, cố ý sai** → status báo `provider: "gemini"`; yêu cầu đi tới máy chủ Google, nhận lỗi `API_KEY_INVALID` (400), backend ghi log và trả lời giải có sẵn — chứng minh đường gọi Gemini và xử lý lỗi chạy đúng.
- Không đăng nhập → 401; câu không tồn tại → 404; gọi từ web app sang backend không bị CORS chặn.
- App chế độ mock: nút chỉ hiện ở câu sai; bấm → "Cú MeMe đang suy nghĩ…" → hộp giải thích; không lỗi console. Typecheck, lint các file mới, build Android/Web đều qua.
- **Gemini thật (key hợp lệ, `gemini-3.6-flash`)** — câu 2001 *"I like _____ football…"*:
  - Chọn sai *play* → `[Gemini AI]` *"Chút nữa là đúng rồi em ơi, em chọn play chưa đúng vì sau like chúng mình không dùng động từ nguyên thể đâu. Đáp án đúng phải là playing vì sau động từ like thường dùng V-ing khi nói về sở thích. Mẹo nhỏ cho em là cứ thấy like chỉ sở thích thì mình chọn từ có đuôi ing nhé!"* (~7–8 giây).
  - Bỏ trống → nhắc "lần sau đừng bỏ trống" rồi giải thích đáp án đúng *playing* (~16 giây).
  - Gửi đáp án đúng → không gọi AI, trả "Bạn đã chọn đúng đáp án rồi" (36 ms).
  - Gọi lại cùng câu + cùng lựa chọn → lấy từ cache (36 ms, không tốn lượt).
  - Trên app (chế độ backend thật): nút → "Cú MeMe đang suy nghĩ…" → hộp giải thích có nhãn **"Gemini AI"**.
- Thời gian chờ Gemini khoảng 7–16 giây/câu ở lần đầu; app hiện cú mèo "đang suy nghĩ" trong lúc chờ (timeout 45 giây).

## 5. Gợi ý khi giải thích (bảo vệ)

- Vì sao gọi AI ở backend chứ không gọi thẳng từ app? → giữ bí mật API key, kiểm soát lượt gọi (bắt đăng nhập + cache), server tự lấy đáp án đúng.
- Vì sao hỗ trợ 2 nhà cung cấp? → đổi nhà cung cấp chỉ bằng biến môi trường, không sửa code app; Gemini có gói miễn phí cho demo.
- Prompt: system instruction đặt vai "Cú MeMe — gia sư tiếng Anh tiểu học", yêu cầu tiếng Việt, tối đa 4 câu, không markdown, chỉ dựa trên dữ liệu được cung cấp; nội dung gửi kèm gồm câu hỏi, các lựa chọn A/B/C/D, đáp án học sinh chọn, đáp án đúng và lời giải tham khảo của giáo viên.
- Xử lý lỗi theo từng loại: Gemini `ApiException` (429 hết lượt/quá tải, 400/403 key hoặc model sai), Claude `RateLimitException` / `AnthropicServiceException`, lỗi mạng/timeout → đều trả lời giải có sẵn để app vẫn dùng được.

---

# AI basic (2) — Giáo viên tải đề lên, Gemini đọc thành bài kiểm tra

> Giáo viên chọn file đề có sẵn (**PDF, Word .docx, ảnh chụp đề JPG/PNG, .txt** — tối đa 8 MB). Gemini tách thành câu hỏi trắc nghiệm (nội dung, 2–4 lựa chọn, đáp án đúng, giải thích ngắn tiếng Việt). Giáo viên **xem lại, sửa đáp án, xoá câu** rồi bấm **"Tạo bài kiểm tra"** → đề được lưu vào MariaDB và **giao cho học sinh** (hiện ở mục *"Đề kiểm tra giáo viên giao"* trên Trang chủ).

## 6. Luồng hoạt động

```
Giáo viên (ExamImportScreen)              Backend Java                                   Gemini
1. chọn vòng + chọn file (expo-document-picker)
2. đọc file → base64 (web: FileReader; điện thoại: expo-file-system)
3. POST /api/exams/import ───────────────▶ ExamImportService
   { fileName, mimeType, dataBase64 }      ├─ PDF / ảnh: gửi thẳng file ───────────────▶ gemini-3.6-flash
                                           ├─ DOCX: tự giải nén word/document.xml lấy chữ,  (structured output:
                                           │        chữ in đậm/gạch chân bọc **...**        JSON đúng khuôn)
                                           └─ làm sạch: bỏ "Câu 1.", "A.", câu < 2 lựa chọn...
   ◀── bản nháp { title, questions[], warnings[] }   (CHƯA lưu gì)
4. giáo viên xem lại: chạm lựa chọn để đổi đáp án đúng, sửa nội dung, xoá câu
5. POST /api/exams ──────────────────────▶ kiểm tra lại từng câu → 1 transaction:
   { roundId, title, durationMinutes,       exams (exam_order = 0) + questions + question_choices
     deadline, questions[] }                + teacher_assignments
6. học sinh: Trang chủ → "Bắt đầu làm bài" → làm và nộp bài như đề thường → điểm thang 100 theo tỉ lệ câu đúng
```

- **Đáp án lấy từ file nếu có**: bảng đáp án cuối đề, chữ in đậm / gạch chân / tô màu (file Word), dấu khoanh... → `answerFromDocument: true`. File không có đáp án → Gemini tự giải, đánh dấu **"Gemini tự giải — kiểm tra lại"**; giáo viên chạm chọn đáp án là coi như đã kiểm tra. Còn câu chưa kiểm tra mà bấm tạo → app hỏi lại.
- **Không tin dữ liệu gửi lên**: `POST /api/exams` kiểm tra lại từng câu (nội dung, 2–4 lựa chọn không trống, đáp án hợp lệ, độ dài), vòng phải đang mở, tối đa 50 câu.
- **Chỉ TEACHER / ADMIN** gọi được các API `/api/exams` (học sinh → 403, chưa đăng nhập → 401). Cần MariaDB (không có → 503 với hướng dẫn).
- **`exam_order = 0`** đánh dấu đề giáo viên tải lên: không thuộc chuỗi 3 bài của vòng nên **không tính vào tiến độ / điểm vòng / mở khoá vòng sau**; màn Kết quả hiện *"Hoàn thành đề giáo viên giao"* thay vì "Làm bài tiếp theo".
- **Xoá đề**: màn *Đề thi* → biểu tượng thùng rác ở đề tải lên → khoá ngoại `ON DELETE CASCADE` xoá luôn câu hỏi, lựa chọn, đề giao và bài làm. Bài thi gốc của vòng không xoá được.
- File `.doc` (Word đời cũ) chưa hỗ trợ → báo lưu lại dạng `.docx`/PDF. File không phải đề → báo "không tìm thấy câu hỏi trắc nghiệm".

## 7. File liên quan (tải đề lên)

| Phần | File |
| --- | --- |
| Gemini đọc file, prompt, khuôn JSON, đọc DOCX, làm sạch dữ liệu | `backend/src/main/java/com/memestudy/backend/ai/ExamImportService.java` |
| API `GET/POST /api/exams`, `POST /api/exams/import`, `DELETE /api/exams/{id}` | `backend/src/main/java/com/memestudy/backend/resource/ExamResource.java` |
| Lưu đề (transaction), danh sách, xoá | `backend/.../store/InMemoryStore.java` → `createTeacherExam`, `listExams`, `deleteTeacherExam` |
| Điểm thang 100 theo số câu (đề không phải 10 câu) | `backend/.../resource/AttemptResource.java`, `frontend/src/services/mock/index.ts` |
| Kiểu dữ liệu | `frontend/src/types/examImport.ts` |
| Service (axios, timeout 120s) + mock | `frontend/src/services/examService.ts` |
| RTK Query | `frontend/src/store/api.ts` → `useImportExamFileMutation`, `useCreateExamMutation`, `useGetExamsQuery`, `useDeleteExamMutation` |
| Màn tải đề (chọn vòng, chọn file, cú mèo "đang đọc đề", xem lại, tạo) | `frontend/src/screens/admin/ExamImportScreen.tsx` (nút ở Dashboard và màn Đề thi) |
| Danh sách đề tải lên + xoá | `frontend/src/screens/admin/ExamListScreen.tsx` |
| Thư viện Expo | `expo-document-picker` (chọn file), `expo-file-system` (đọc file trên điện thoại) — đều có sẵn trong Expo Go |

## 8. Đã kiểm tra (26/11/2026, Gemini thật + MariaDB)

- **File Word** 6 câu trắc nghiệm + 1 câu tự luận; câu 1–4 đáp án in đậm, câu 5–6 không có đáp án → Gemini đọc đúng 6 câu (bỏ câu tự luận), câu 1–4 lấy đúng đáp án in đậm, câu 5–6 tự giải đúng (*on*, *does*) và được đánh dấu "kiểm tra lại" (~16 giây).
- **File PDF** 5 câu + bảng đáp án cuối đề → dùng đúng bảng đáp án cho cả 5 câu (~10 giây).
- **File ghi chú không phải đề** → 422 "Không tìm thấy câu hỏi trắc nghiệm nào trong file". File `.doc` → 415. Học sinh gọi API → 403; chưa đăng nhập → 401; vòng đang khoá → 400; câu chỉ có 1 lựa chọn → 400.
- **Trên app (web, tài khoản teacher)**: chọn vòng → chọn file → cú mèo "đang nhờ Gemini đọc đề" → bản nháp 6 câu + cảnh báo → chạm đổi đáp án câu 5 (hết nhãn "kiểm tra lại") → tạo → hỏi lại vì còn 1 câu chưa kiểm tra → "Đã tạo bài kiểm tra" → đề hiện ở màn Đề thi.
- **MariaDB**: 1 dòng `exams` (id 9001, `exam_order = 0`), 6 `questions` (đúng `correct_choice_id`), 24 `question_choices`, 1 `teacher_assignments`.
- **Học sinh (tài khoản user)**: Trang chủ hiện đề mới "Chưa làm" → làm 6 câu (4 đúng, 1 sai, 1 bỏ trống) → **67/100**, mỗi câu đúng +17 đ, thông báo "Hoàn thành đề giáo viên giao"; "Hỏi Cú AI" giải thích được câu sai của đề mới; Trang chủ chuyển "Đã làm: 67/100 đ"; tiến độ vòng **không** đổi (Vòng 02 vẫn 0/3, tổng 3/9); màn Vòng thi vẫn 3 bài/vòng. Bài làm lưu vào `attempts` (`exam_order = 0`, score 67) + 6 `attempt_answers` (câu bỏ trống `choice_id = NULL`).
- **Xoá đề** bằng API → cascade xoá hết; database trở về đúng số dòng ban đầu (12 bài thi, 30 câu, 120 lựa chọn, 2 đề giao, 6 lượt thi, 60 câu trả lời).
- Chưa thử trên điện thoại thật (đường đọc file bằng `expo-file-system` chỉ chạy trên Android/iOS).

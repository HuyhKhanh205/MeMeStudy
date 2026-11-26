# Báo cáo tiến độ — Bài tập lớn MeMeStudy

> Ngày báo cáo: 25/11/2026 · Nhóm: Minh Khánh, Chìu Kim Thi · Repo: https://github.com/HuyhKhanh205/MeMeStudy
> Phiên bản kiểm tra: nhánh `main` tại commit `5507e7e` (Merge PR #9, 25/11/2026) — đã đồng bộ máy local với GitHub.

## 1. Tóm tắt

- App **chạy được**: typecheck sạch, build được bản **Android** và **Web**, chạy thử chế độ mock (đăng nhập → Trang chủ → các tab) không lỗi console.
- Đã đạt **10/12 yêu cầu** của đề, gồm **AI basic** (Cú AI giải thích câu sai bằng **Gemini**, đã chạy thật với API key ngày 25/11). **1 yêu cầu chưa xác nhận** (chạy trên thiết bị thật). **1 yêu cầu bắt buộc chưa làm**: **Build & phân phối qua internet**.
- Ngoài kế hoạch ban đầu, nhóm đã có **backend Java thật** (Tomcat 10.1 + Jersey + JWT) kết nối **MariaDB** (9 bảng, script khởi tạo sẵn).
- Rủi ro lớn nhất: 2 yêu cầu bắt buộc còn thiếu, README đã cũ, chưa có bản build/link tải để nộp.

## 2. Đồng bộ code & các nhánh

| Nhánh trên GitHub | Tình trạng |
| --- | --- |
| `main` (`5507e7e`) | **Bản hoàn chỉnh nhất** — đã gộp mọi nhánh bên dưới. Máy local đã kéo về (fast-forward, không xung đột). |
| `Thi/HoanThien-FE-Backend` | Đã merge vào `main` qua PR #6–#9 (25/11). |
| `Thi/UserScreen` | Đã merge (PR #4). |
| `Khanh` | Đã merge (PR #3). |
| `thi` (chữ thường) | Bản tuần 1 cũ, đã được làm lại ở các nhánh sau — không cần merge. Trùng tên với `Thi/...` gây lỗi `git fetch` trên Windows → nên xoá sau khi Thi đồng ý. |

Lịch sử merge: PR #1 (27/10) → #2 (05/11) → #3 Khanh (06/11) → #4 + merge backend (17/11) → #6, #7, #8, #9 (25/11).

## 3. Kết quả kiểm tra kỹ thuật (25/11/2026)

| Hạng mục | Kết quả |
| --- | --- |
| Cài thư viện (`npm install`) | ✅ OK |
| Typecheck (`npx tsc --noEmit`) | ✅ Không lỗi |
| Build Android (`npx expo export --platform android`) | ✅ OK — bundle 5.6 MB |
| Build Web (`npx expo export --platform web`) | ✅ OK — bundle 3.5 MB |
| Chạy thử Web, chế độ mock | ✅ Đăng nhập `user / 123456` → Trang chủ hiển thị đợt thi, 3 vòng, đề giáo viên giao, tiến độ; chuyển tab Vòng thi / Lịch sử / Cá nhân bình thường; không lỗi console |
| Lint (`npx expo lint`) | ⚠️ 9 lỗi, 17 cảnh báo — chủ yếu luật mới của React Hooks (ExamScreen, useCountdown, motion.tsx); không làm hỏng build |
| Backend Java | ⚠️ Chưa biên dịch thử được trên máy kiểm tra: không có Maven và repo thiếu thư mục `.mvn/` nên `mvnw.cmd` không chạy. Thi chạy bằng IntelliJ (có cấu hình chạy sẵn). |
| Test tự động | ❌ Chưa có |
| Chạy trên thiết bị thật | ❓ Chưa có xác nhận |

## 4. Đối chiếu yêu cầu đề bài

| # | Yêu cầu | Trạng thái | Hiện có |
| --- | --- | --- | --- |
| 1 | ~10 chức năng, 10–15 màn hình | ✅ Đạt | 11 màn: Đăng nhập, Đăng ký, Trang chủ, Vòng thi, Làm bài, Kết quả (kèm ôn câu sai + giải thích), Lịch sử, Cá nhân (sửa hồ sơ, đổi mật khẩu), Dashboard, Câu hỏi, Đề thi |
| 2 | Có backend (tự xây hoặc mock) | ✅ Đạt | Backend Java Tomcat + Jersey + JWT + MariaDB; FE vẫn giữ chế độ mock để demo |
| 3 | Dùng Axios | ✅ Đạt | `services/http.ts`: interceptor Bearer, chuẩn hoá lỗi, tự đăng xuất khi 401 |
| 4 | Dùng Expo project | ✅ Đạt | Expo SDK 57, RN 0.86, TypeScript |
| 5 | Build & phân phối qua internet | ❌ Chưa | Chưa có `eas.json`, chưa có APK/link tải, chưa host bản web, backend chưa deploy |
| 6 | AI basic | ✅ Đạt | "Hỏi Cú AI vì sao sai?" ở màn Kết quả → `POST /api/ai/explain` → Gemini (`gemini-3.6-flash`; hoặc Claude), key chỉ ở backend (`backend/ai.local.properties`, gitignored). Đã chạy thật: AI giải thích đúng câu chọn sai và câu bỏ trống bằng tiếng Việt, có cache. Thêm (26/11): **giáo viên tải đề PDF/Word/ảnh lên → Gemini tách câu hỏi → xem lại → tạo bài kiểm tra giao cho học sinh** (`POST /api/exams/import`, `POST /api/exams`). Chi tiết: `docs/ai-basic.md` |
| 7 | Redux Toolkit / TanStack Query | ✅ Đạt | Redux Toolkit + RTK Query (`store/api.ts`), cache + invalidate khi nộp bài |
| 8 | Chạy trên thiết bị thật | 🟡 Chưa xác nhận | Các module đều có trong Expo Go; cần test và chụp ảnh minh chứng |
| 9 | Responsive (xoay ngang, tablet) | ✅ Đạt | `orientation: default`, hook `useResponsive`, bố cục 2 cột khi ngang ở Làm bài / Kết quả / danh sách |
| 10 | Animation basic | ✅ Đạt | Reanimated 4 (`components/motion.tsx`): mascot nhấp nhô, cá bơi, câu hỏi trượt, nút co khi nhấn, confetti, sao nảy, điểm đếm tăng |
| 11 | TamaGUI | ✅ Đạt | Tamagui ở component dùng chung (Button, Card, TextField, Screen, LoadingView, ErrorView) và 16 file |
| 12 | Link GitHub | ✅ Đạt | Repo có đầy đủ lịch sử PR |
| — | Đồ hoạ có trích nguồn | ✅ Đạt | Fluent Emoji 3D (MIT), Ionicons (MIT), Google Fonts (OFL) — `frontend/CREDITS.md` |

## 5. Chức năng đã hoàn thành

**Frontend (Expo)**
- Đăng nhập theo vai trò **Học sinh / Giáo viên**, đăng ký, khôi phục phiên (token lưu SecureStore / localStorage).
- Trang chủ học sinh: đợt thi hiện tại, 3 vòng thi có trạng thái (đã xong / đang thi / khoá), đề giáo viên giao, ôn tập nhanh, tiến độ học tập theo tài khoản.
- Vòng thi → bài thi (3 bài × 10 câu), mở khoá vòng sau theo kết quả.
- Làm bài theo Figma Style A: đồng hồ đếm ngược tự nộp, thanh bước, câu nghe/hình, hỏi lại khi thoát giữa chừng.
- Kết quả: điểm, sao, thời gian, đúng/sai, **xem lại đáp án và giải thích từng câu**, **hỏi Cú AI giải thích riêng từng câu sai** (AI basic).
- Lịch sử kết quả; Cá nhân: thông tin, **sửa hồ sơ**, **đổi mật khẩu**, đăng xuất; popup thông báo trong app.
- Giáo viên/Admin: Dashboard thống kê, danh sách câu hỏi, danh sách đề (**chỉ xem**).

**Backend (Java)**
- API: `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/password`, `GET /rounds`, `GET /rounds/{id}`, `POST /rounds/{id}/attempts`, `POST /attempts/{id}/submit`, `GET /attempts`, `GET /attempts/{id}/review`, `GET /questions`, `GET /user-data`, `GET /health`, **`POST /ai/explain`**, **`GET /ai/status`** (AI basic), **`GET/POST /exams`**, **`POST /exams/import`**, **`DELETE /exams/{id}`** (giáo viên tải đề lên bằng Gemini).
- JWT, CORS filter, kết nối MariaDB qua JDBC (đọc `db.properties` hoặc biến môi trường), tự khởi tạo bảng nếu chưa có.

**Database**: `database/memestudy_mariadb.sql` — 9 bảng (`users`, `seasons`, `rounds`, `exams`, `questions`, `question_choices`, `teacher_assignments`, `attempts`, `attempt_answers`) + dữ liệu mẫu.

## 6. Tiến độ theo kế hoạch FE (docs/ke-hoach-fe.md)

| Mã | Việc | Người làm | Trạng thái |
| --- | --- | --- | --- |
| FE-3 | Tích hợp TamaGUI | Thi | ✅ Xong |
| FE-1 | Responsive xoay ngang / tablet | Thi | ✅ Xong |
| FE-2 | Animation basic | Khánh | ✅ Xong |
| FE-6 | Hồ sơ cá nhân | Thi | ✅ Xong (thêm sửa hồ sơ, đổi mật khẩu) |
| FE-8 | Trang chủ theo Figma Style A | Thi | ✅ Xong |
| FE-5 | Ôn lại câu sai | Thi | ✅ Xong (nằm trong màn Kết quả) |
| FE-4 | Admin: thêm/sửa/xoá câu hỏi & đề | Khánh | ❌ Chưa (hiện chỉ xem) |
| FE-7 | AI basic | Khánh | ✅ Xong (25/11) — đã chạy thật với Gemini |
| FE-9 | Máy thật + lint | Cả hai | 🟡 Có cấu hình lint nhưng còn 9 lỗi; chưa test máy thật |

Phần backend (bước 1.2–1.4 và một phần 2.1 trong kế hoạch tổng thể, dự kiến giao Khánh) **Thi đã làm**.

## 7. Đóng góp trên GitHub (nhánh `main`)

| Thành viên | Số commit | Phần việc chính |
| --- | --- | --- |
| Chìu Kim Thi | 44 | Giao diện học sinh (Trang chủ, Vòng thi, Làm bài, Kết quả, Lịch sử, Cá nhân), Tamagui, responsive, backend Java + MariaDB, script SQL, tài liệu giải thích tuần 1 |
| Minh Khánh | 6 (gồm 1 commit lớn: 103 file, +4.879 dòng) | Cấu trúc frontend, Axios + mock, RTK Query, phân quyền điều hướng, màn thi/kết quả Style A ban đầu, đồ hoạ Fluent Emoji + trích nguồn, animation, kế hoạch dự án, merge các nhánh |

## 8. Vấn đề cần xử lý

1. ~~Màn Kết quả đánh dấu nhầm câu đúng thành "Cần ôn lại"~~ — **đã sửa 25/11**: dữ liệu bài làm mẫu trong bộ nhớ của backend (`InMemoryStore.createSeedReview`) luôn chọn đáp án A cho câu "sai", trùng đáp án đúng khi A là đáp án đúng. Đã đổi sang chọn đáp án sai thật; màn Kết quả cũng tính đúng/sai theo chính lựa chọn của học sinh nên không thể tự mâu thuẫn. Kiểm tra lại bài "Listening Practice": 10/10 thẻ khớp, 9/10 điểm, Gemini giải thích đúng Câu 10.
2. **Build & phân phối chưa có** (bắt buộc) — cần `eas.json`, build APK `preview` (link tải), host bản web, deploy backend (hoặc ngrok khi demo).
3. **README.md đã cũ** — vẫn mô tả backend Node/Express và `frontend/user`, `frontend/admin`; cần viết lại cách chạy FE + BE + MariaDB và tài khoản demo.
4. ~~**Bảo mật**: khoá ký JWT viết cứng, backend chấp nhận `mock-token-N`~~ — **đã sửa 26/11**: `JWT_SECRET` lấy từ biến môi trường, chặn `mock-token`, chế độ `APP_ENV=production` (bắt buộc có DB, không lặng lẽ lưu vào RAM); app không còn chấm điểm cục bộ khi nộp bài lỗi mạng. Chi tiết: `docs/ke-hoach-hoan-thien-va-deploy.md`.
5. **Admin chỉ xem được**, chưa thêm/sửa/xoá câu hỏi và đề.
6. **Lint còn 9 lỗi** (React Hooks) — nên sửa để code sạch khi giải thích.
7. Backend thiếu `.mvn/wrapper` nên `mvnw.cmd` không chạy ngoài IntelliJ; repo đang commit `backend/.idea/` (cấu hình IDE cá nhân).
8. 4 file kế hoạch trong `docs/` (`ke-hoach-*.md/.docx`) **chưa được commit**.
9. Chưa có test tự động; chưa có ảnh/video chạy trên thiết bị thật.

## 9. Việc tiếp theo (đề xuất theo thứ tự ưu tiên)

| Ưu tiên | Việc | Đề xuất người làm |
| --- | --- | --- |
| 1 | Chụp ảnh/quay video minh chứng AI basic (Gemini) trên app | Khánh |
| 2 | EAS build APK + link tải; host bản web; deploy backend (hoặc ngrok) | Khánh (APK) · Thi (backend/web) |
| 3 | Test trên điện thoại thật + chụp ảnh/quay video minh chứng (dọc, ngang, tablet) | Cả hai |
| 4 | Viết lại README (cách chạy, tài khoản demo, link APK/web, ảnh chụp) | Cả hai |
| 5 | Admin CRUD câu hỏi/đề (nếu còn thời gian) | Khánh |
| 6 | Sửa 9 lỗi lint, commit tài liệu kế hoạch (JWT secret đã chuyển sang biến môi trường 26/11) | Cả hai |
| 7 | Chuẩn bị phần giải thích code: mỗi người phần mình (đề yêu cầu) | Cả hai |

# Kế hoạch tổng thể — Bài tập lớn MeMeStudy

> Cập nhật: 06/11/2026 · Thời gian làm: 3 tuần · Nhóm 2 người (Khánh, Thi)
> Kế hoạch FE chi tiết, chia việc cho 2 người: [ke-hoach-fe.md](ke-hoach-fe.md) · Nguồn đồ hoạ: [frontend/CREDITS.md](../frontend/CREDITS.md)

## 1. Đối chiếu yêu cầu đề bài

| # | Yêu cầu đề | Trạng thái | Đã có / còn thiếu |
| --- | --- | --- | --- |
| 1 | ~10 chức năng, 10–15 màn hình | 🟡 Một phần | Đã có **10 màn**: Login, Register, Home, RoundList, Exam, Result, History, Dashboard, QuestionList, ExamList. Còn thiếu: CRUD câu hỏi/đề (admin), ôn lại câu sai, hồ sơ cá nhân, AI → dự kiến 14 màn. |
| 2 | Có backend (tự xây hoặc mock API) | 🟡 Một phần | FE có **mock API** đầy đủ (`EXPO_PUBLIC_USE_MOCK=true`). Backend Java (Jetty + Jersey + Hibernate + H2) mới có `GET /api/health`. |
| 3 | Dùng Axios để gọi API | ✅ Xong | `frontend/src/services/http.ts`: axios instance, interceptor gắn `Bearer` token, chuẩn hoá lỗi thành `ApiError`, tự đăng xuất khi 401. |
| 4 | Dùng Expo project | ✅ Xong | Expo SDK 57, React Native 0.86, TypeScript, React Navigation 7. |
| 5 | Build và phân phối qua internet | ❌ Chưa | Cần EAS Build (APK nội bộ có link tải) + EAS Update (OTA) + bản web. |
| 6 | AI basic | ✅ Đã làm (25/11) | "Hỏi Cú AI vì sao sai?" ở màn Kết quả → `POST /api/ai/explain` (Gemini hoặc Claude, key chỉ ở backend). Chờ đặt `GOOGLE_API_KEY` để chạy AI thật — xem `docs/ai-basic.md`. |
| 7 | Redux Toolkit hoặc TanStack Query | ✅ Xong | **RTK Query** (`frontend/src/store/`): cache, loading/error, refetch, `invalidatesTags` (nộp bài → Lịch sử tự cập nhật), reset cache khi đăng xuất. |
| 8 | Chạy được trên thiết bị thật | 🟡 Chưa kiểm tra | Mới chạy thử trên web. Cần test Expo Go / bản build APK trên điện thoại. |
| 9 | Responsive (xoay ngang, tablet/iPad) | ❌ Chưa | `app.json` đang khoá `"orientation": "portrait"`; layout chưa có breakpoint. |
| 10 | Animation basic | ✅ Xong | `react-native-reanimated`: mascot nhấp nhô, cá bơi, bong bóng trôi, câu hỏi trượt, nút co khi nhấn, confetti rơi, sao nảy, điểm đếm tăng, danh sách hiện lần lượt (`frontend/src/components/motion.tsx`). |
| — | Đồ hoạ miễn phí, có trích nguồn | ✅ Xong | Microsoft Fluent Emoji 3D (MIT) + Ionicons (MIT) + Google Fonts (OFL), ghi trong `frontend/CREDITS.md`. |
| 11 | TamaGUI | ❌ Chưa | Hiện style bằng `StyleSheet` + `src/theme`. Phải tích hợp Tamagui (xem mục 4 — Rủi ro). |
| 12 | Link GitHub (code) | ✅ Có repo | https://github.com/HuyhKhanh205/MeMeStudy — cần commit/push phần FE mới. |
| — | Giải thích được code (dùng AI hỗ trợ) | ⚠️ Lưu ý | Mỗi người phải hiểu và trình bày được phần mình làm, kể cả phần AI viết. |

## 2. Các bước tiếp theo

### Tuần 1 — Nền tảng & backend thật

| Bước | Việc cần làm | Phụ trách (đề xuất) |
| --- | --- | --- |
| 1.1 | Commit & push toàn bộ thay đổi FE hiện tại lên GitHub (nhánh `main` hoặc PR), để Thi làm tiếp trên cùng code. | Khánh |
| 1.2 | Backend: entity + bảng H2/Hibernate cho `User`, `Round`, `Question`, `Choice`, `Attempt`, `Answer`. Seed dữ liệu giống mock (`frontend/src/services/mock/data.ts`). | Khánh |
| 1.3 | Backend: `POST /auth/login`, `POST /auth/register`, `GET /auth/me` (jBCrypt + JWT — thư viện đã có trong `pom.xml`), filter kiểm tra `Bearer` token và quyền `ADMIN`. | Khánh |
| 1.4 | Backend: `GET /rounds`, `POST /rounds/{id}/attempts`, `POST /attempts/{id}/submit`, `GET /attempts` (lịch sử), `GET /questions` (admin). Response đúng kiểu ở mục 3. | Khánh |
| 1.5 | FE: Tamagui (FE-3) — merge sớm — rồi Responsive (FE-1). | Thi |
| 1.5b | FE: phần dữ liệu của CRUD admin (FE-4: types, service, mock, RTK Query). | Khánh |
| 1.6 | Chạy FE với `EXPO_PUBLIC_USE_MOCK=false` trỏ vào backend thật (dùng IP LAN khi test trên điện thoại). | Cả hai |

### Tuần 2 — Đủ chức năng

| Bước | Việc cần làm | Phụ trách (đề xuất) |
| --- | --- | --- |
| 2.1 | Backend: CRUD `/questions`, `/rounds` cho admin; `GET /attempts/{id}/review` (đáp án đã chọn + đáp án đúng). | Khánh |
| 2.2 | Backend: AI — `POST /ai/explain` và `POST /ai/generate-questions`. API key để ở biến môi trường của backend, **không** đưa vào app. | Khánh |
| 2.3 | FE: Hồ sơ cá nhân (FE-6). (FE-2 Animation đã xong.) | Thi |
| 2.3b | FE: giao diện CRUD admin (FE-4), Ôn lại câu sai (FE-5). | Khánh |
| 2.3c | FE: AI basic (FE-7) — có thể lùi sang đầu tuần 3. | Khánh |
| 2.4 | Test trên thiết bị thật (Android + nếu có thể iOS/iPad), ghi lại lỗi. | Cả hai |

### Tuần 3 — Build, phân phối, hoàn thiện

| Bước | Việc cần làm | Phụ trách (đề xuất) |
| --- | --- | --- |
| 3.1 | Deploy backend lên internet (Render / Railway / VPS, hoặc ngrok khi demo) và cập nhật `EXPO_PUBLIC_API_URL`. | Khánh |
| 3.2 | EAS: `npx eas-cli@latest build:configure`, profile `preview` build **APK** (`distribution: internal`) → chia sẻ link tải; `eas update` cho bản sửa nhanh. | Khánh |
| 3.3 | Bản web: `npx expo export --platform web` rồi host (EAS Hosting / Netlify / Vercel); Home/RoundList theo Figma (FE-8) nếu còn thời gian. | Thi |
| 3.4 | Sửa lỗi sau test máy thật, chạy `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`. | Cả hai |
| 3.5 | Viết README: cách chạy, tài khoản demo, link APK/web, ảnh chụp màn hình; chuẩn bị phần giải thích code (mỗi người phần mình). | Cả hai |

## 3. Hợp đồng API (FE đang dùng)

Base URL: `http://<host>:8080/api`. Header `Authorization: Bearer <token>` cho mọi API trừ login/register. Lỗi trả `{ "message": "...", "details"?: ... }` kèm HTTP status. FE chấp nhận cả body thô lẫn bọc `{ "data": ... }`.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ username, password }` | `{ token, user }` |
| POST | `/auth/register` | `{ username, password, fullName }` | `{ token, user }` |
| GET | `/auth/me` | — | `User { id, username, fullName, role: "USER" \| "ADMIN" }` |
| GET | `/rounds` | — | `Round[] { id, title, description, durationMinutes, questionCount, isOpen }` |
| POST | `/rounds/{id}/attempts` | — | `Attempt { id, roundId, roundTitle, status, startedAt, expiresAt, questions: [{ id, content, choices: [{ id, content }] }] }` — **không** trả đáp án đúng |
| POST | `/attempts/{id}/submit` | `{ answers: [{ questionId, choiceId \| null }] }` | `AttemptResult { attemptId, roundId, roundTitle, score, correctCount, totalQuestions, submittedAt, review?: [{ questionId, correct }] }` |
| GET | `/attempts` | — | `AttemptResult[]` của user hiện tại (mới nhất trước) |
| GET | `/questions` | — (ADMIN) | `Question[]` có `correctChoiceId` |
| *mới* | CRUD `/questions`, `/rounds`; `GET /attempts/{id}/review`; `POST /ai/explain`; `POST /ai/generate-questions` | Chốt chi tiết khi làm FE-4/5/7 | |

Kiểu dữ liệu chuẩn nằm ở `frontend/src/types/`; khi đổi API phải sửa cả types và mock.

## 4. Rủi ro & quyết định cần chốt

- **Tamagui vs StyleSheet**: ban đầu nhóm chọn StyleSheet + theme, nhưng đề **bắt buộc TamaGUI**. Đề xuất: dùng Tamagui cho component dùng chung và các màn auth/user/admin; giữ StyleSheet cho bộ component "game" (Figma Style A) vì cần vẽ chính xác từng pixel. Cần kiểm tra Tamagui hỗ trợ Expo SDK 57 / React 19.2 trước khi chuyển.
- **Expo Go**: các module đang dùng (`expo-secure-store`, `expo-image`, `expo-linear-gradient`, `expo-font`, `react-native-reanimated`) đều có sẵn trong Expo Go. Thêm thư viện native ngoài danh sách → phải dùng development build (`eas build --profile development`).
- **AI key**: tuyệt đối không để key trong app (`EXPO_PUBLIC_*` sẽ lộ trong bundle). Chỉ backend giữ key.
- **Mock**: giữ chế độ mock chạy được đến cuối để demo khi backend gặp sự cố.

# Rà soát chức năng chưa hoàn thiện & kế hoạch deploy — MeMeStudy

> Ngày rà soát: 26/11/2026 · Nhánh `Khanh-AI-Gemini-TaiDe` (commit `b41e312`) · Người rà: Khánh (có AI hỗ trợ)
> **Cập nhật 26/11: đã sửa L1–L5** (mục 2.1, có kết quả kiểm tra ở mục 2.2).
> Đi kèm: [bao-cao-tien-do.md](bao-cao-tien-do.md) · [ke-hoach-tong-the.md](ke-hoach-tong-the.md) · [ai-basic.md](ai-basic.md)

## 1. Tóm tắt

- **Còn thiếu 2 yêu cầu bắt buộc**: *Build & phân phối qua internet* (chưa có `eas.json`, APK, bản web hay backend online) và *Chạy trên thiết bị thật* (chưa có minh chứng).
- **Các lỗi cần sửa trước khi deploy (L1–L5) đã sửa xong ngày 26/11**, gồm:
  - Bài làm có thể "nộp thành công" mà không được lưu.
  - Ai cũng giả được tài khoản giáo viên bằng `mock-token-N`.
- **Chức năng còn dở**: Admin chưa thêm/sửa/xoá câu hỏi và vòng thi, chỉ có tải đề bằng Gemini; README đã cũ; lint còn 9 lỗi.
- **Hướng deploy đề xuất**:
  - Backend Java (Docker) + MariaDB/MySQL trên một dịch vụ cloud có HTTPS.
  - App Android: APK qua **EAS Build**, có link tải.
  - Bản web: **EAS Hosting**.
  - Sửa nhanh qua **EAS Update**.

## 2. Chức năng chưa hoàn thiện & hướng giải quyết

Mức độ: 🔴 phải làm trước khi deploy/nộp · 🟠 nên làm · 🟢 nếu còn thời gian.

### 2.1. Lỗi / rủi ro trong code hiện có

| # | Vấn đề | Mức | Bằng chứng | Hướng giải quyết |
| --- | --- | --- | --- | --- |
| L1 ✅ | **Nộp bài "thành công" nhưng không lưu DB.** `ExamScreen` gọi thẳng `mockApi.startAttempt/submitAttempt`. Khi backend lỗi hoặc mất mạng, hai hàm này **lặng lẽ** chuyển sang chấm điểm trên máy: học sinh vẫn thấy điểm nhưng bài không vào MariaDB, tải lại app là mất. | 🔴 | `frontend/src/services/mock/index.ts` (các khối `catch { // Fallback ... }`), `screens/user/ExamScreen.tsx:170` | Ở chế độ backend thật thì **bỏ fallback**: lỗi mạng → báo lỗi và cho bấm "Nộp lại", giữ đáp án trong state. Màn Làm bài chuyển sang `attemptService` / RTK Query (`useStartAttemptMutation`, `useSubmitAttemptMutation` đã có sẵn trong `store/api.ts` nhưng chưa dùng). Chỉ chế độ `EXPO_PUBLIC_USE_MOCK=true` mới chấm cục bộ. |
| L2 ✅ | **Giả mạo tài khoản**: backend chấp nhận token `mock-token-<id>` không cần chữ ký. Ai gửi `mock-token-3` cũng thành giáo viên, có thể tạo hoặc xoá đề. | 🔴 | `backend/.../security/JwtUtil.java` | Mặc định từ chối `mock-token-`. Chỉ chấp nhận khi chạy ở máy **và** đặt `ALLOW_MOCK_TOKEN=true`; ở `APP_ENV=production` thì không bao giờ chấp nhận. |
| L3 ✅ | **Khoá ký JWT viết cứng** trong mã nguồn đã đưa lên GitHub, nên ai cũng tự ký được token hợp lệ. | 🔴 | `JwtUtil.SECRET` | Đọc từ biến môi trường `JWT_SECRET` (≥ 32 byte). Thiếu thì dùng khoá cũ **chỉ khi chạy ở máy** và in cảnh báo. Ở `APP_ENV=production`, thiếu hoặc quá ngắn thì backend không khởi động. |
| L4 ✅ | **Mất DB thì âm thầm chuyển sang lưu trong RAM.** Trên server, sai cấu hình DB sẽ khiến dữ liệu mất mỗi lần khởi động lại mà không ai biết. | 🟠 | `DatabaseManager` (log "tự chuyển sang lưu dữ liệu trong bộ nhớ") | Biến `APP_ENV=production` trên server: không kết nối được DB thì dừng hẳn. Mất DB giữa chừng thì API trả 503 (`DatabaseRequiredFilter`) và tự kết nối lại sau ≤ 10 giây. `/api/health` trả trạng thái DB. |
| L5 ✅ | Đường dẫn script SQL có ổ đĩa cứng của máy Thi (`E:/HK7/...`); trên server không tìm thấy file nên không tự tạo bảng. | 🟠 | `DatabaseManager.java:122-125` | Thêm biến `DB_INIT_SCRIPT`, bỏ đường dẫn tuyệt đối. Docker image copy `database/memestudy_mariadb.sql` vào đúng chỗ. **Thêm:** script có `CREATE DATABASE memestudy` / `USE memestudy`, nay được bỏ qua để luôn nạp vào đúng database trong `DB_URL`; kiểm tra bảng theo database hiện tại chứ không cố định tên `memestudy`. |
| L6 | CORS mở `*` kèm `Allow-Credentials: true`. Trình duyệt không chấp nhận cặp này; hiện không lỗi vì app dùng header Bearer chứ không dùng cookie. | 🟢 | `filter/CorsFilter.java` | Bỏ `Allow-Credentials`, hoặc lấy danh sách origin từ `CORS_ORIGINS` (domain bản web). |
| L7 | Lint: 9 lỗi + 17 cảnh báo (luật React Hooks). | 🟠 | `npx expo lint` | Sửa từng lỗi; khi thuyết trình code sẽ đỡ bị hỏi. |

### 2.2. Đã sửa L1–L5 (26/11/2026) — file thay đổi & kết quả kiểm tra

| Lỗi | File |
| --- | --- |
| L1 | `frontend/src/services/mock/index.ts` (bỏ chấm cục bộ khi `USE_MOCK=false`), `frontend/src/screens/user/ExamScreen.tsx` (giữ id lượt thi để nộp lại, xử lý 409, thông báo "Chưa nộp được bài") |
| L2, L3 | `backend/.../security/JwtUtil.java`, `backend/.../config/AppConfig.java` (mới) |
| L4 | `backend/.../db/DatabaseManager.java`, `backend/.../filter/DatabaseRequiredFilter.java` (mới), `backend/.../resource/HealthResource.java`, `backend/.../TomcatServer.java` |
| L5 | `backend/.../db/DatabaseManager.java` |

Kết quả kiểm tra (backend + MariaDB thật trên máy Khánh, app web ở chế độ backend thật):

- **Backend: 26/26 trường hợp đạt.**
  - Chạy ở máy như cũ.
  - `mock-token` bị trả 401, và chỉ được chấp nhận khi bật `ALLOW_MOCK_TOKEN`.
  - Token ký bằng khoá cũ bị từ chối sau khi đổi `JWT_SECRET`.
  - Production thiếu hoặc `JWT_SECRET` quá ngắn → backend dừng; sai mật khẩu DB → backend dừng.
  - Database **mới tinh, chạy từ thư mục khác, tài khoản DB không có quyền `CREATE DATABASE`** → tự nạp bảng, đăng nhập, làm và nộp bài đều được.
  - Khoá tài khoản DB giữa chừng → API và `/health` trả 503, đăng nhập không rơi về dữ liệu RAM; mở khoá → tự kết nối lại.
  - Database `memestudy` thật không bị đụng tới.
- **App:**
  - Chặn yêu cầu nộp bài → hiện "Chưa nộp được bài", vẫn ở màn làm bài, đáp án còn nguyên.
  - Nộp lại khi máy chủ đã lưu nhưng mất phản hồi → dùng lại đúng lượt thi (không tạo lượt mới), DB chỉ có 1 bài.
  - Nộp lần nữa → máy chủ trả 409 → "Bài đã được nộp", về Trang chủ, điểm hiển thị đúng.
  - Nộp bình thường vẫn ra màn Kết quả.
  - Bài làm thử đã xoá khỏi DB sau khi test.
- `npx tsc --noEmit` sạch; lint giữ nguyên 9 lỗi / 17 cảnh báo cũ, không có lỗi mới.

Còn lưu ý:
- Yêu cầu **đầu tiên** ngay sau khi DB rớt có thể vẫn trả dữ liệu từ RAM. Từ yêu cầu thứ hai, mọi API đều trả 503.
- `ensureDefaultPasswords` đặt lại mật khẩu `123456` cho 3 tài khoản demo mỗi lần khởi động. Khi deploy, đó là tài khoản demo công khai: không lưu dữ liệu thật vào đó.
- Script SQL và câu `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` là cú pháp **MariaDB**, nên khi deploy nên chọn **MariaDB** chứ không phải MySQL.

### 2.3. Chức năng còn thiếu

| # | Chức năng | Mức | Hiện trạng | Hướng giải quyết |
| --- | --- | --- | --- | --- |
| C1 | **Build & phân phối qua internet** (bắt buộc) | 🔴 | Chưa có gì | Xem mục 3. |
| C2 | **Chạy trên thiết bị thật** (bắt buộc) | 🔴 | Mới chạy web | Chạy Expo Go trên điện thoại (cùng Wi-Fi, dùng IP LAN), sau đó cài APK từ EAS. Chụp ảnh/quay video: dọc, ngang, tablet nếu có. |
| C3 | Admin thêm/sửa/xoá câu hỏi & vòng thi (FE-4) | 🟠 | Chỉ xem; tạo đề chỉ qua tải file bằng Gemini | Tận dụng trình sửa bản nháp của `ExamImportScreen`: thêm nút **"Soạn đề thủ công"** mở cùng màn với bản nháp rỗng (không gọi Gemini), và **"Sửa đề"** cho đề giáo viên (`PUT /exams/{id}`). Phần này đủ cho yêu cầu CRUD và tái dùng code có sẵn, không cần làm CRUD cho đề vòng thi gốc. |
| C4 | Giáo viên xem kết quả học sinh làm đề mình giao | 🟢 | Dashboard chỉ có số câu hỏi/vòng | `GET /exams/{id}/results` (danh sách học sinh, điểm, thời gian) cùng một màn danh sách. |
| C5 | README | 🟠 | Vẫn mô tả Node/Express và `frontend/user`, `frontend/admin` | Viết lại: kiến trúc, cách chạy FE/BE/DB, biến môi trường, tài khoản demo, link APK/web, ảnh chụp. |

### 2.4. Dọn dẹp (🟢)

- Thư mục `docs/` (bao gồm file này) **chưa được commit**: lần trước mới làm commit 1–4, còn bước 5 (`git add docs`) chưa chạy.
- `backend/.idea/workspace.xml` đang được Git theo dõi. Đây là cấu hình IDE riêng từng máy: nên `git rm --cached` và thêm vào `.gitignore` (bàn với Thi trước).
- `pom.xml` còn `hibernate-core`, `hibernate-validator`, `h2` nhưng code không dùng. Bỏ đi để image nhẹ và build nhanh hơn (kiểm tra lại bằng build).
- `backend/tomcat.8080`, `tomcat.8090`: thư mục tạm của Tomcat, nên thêm `tomcat.*/` vào `.gitignore`.
- Chưa có test tự động. Tối thiểu nên có một script smoke test API, xem mục 3.6.

## 3. Kế hoạch deploy

### 3.1. Kiến trúc mục tiêu

```
Điện thoại (APK) ─┐
                  ├── HTTPS ──► Backend Java (Docker, Tomcat embed, cổng $PORT) ──► MariaDB/MySQL (managed)
Trình duyệt (web) ┘                       │
   ▲ EAS Hosting                          └──► Gemini API (key ở biến môi trường)
```

- **Bắt buộc HTTPS**: bản APK release của Android mặc định chặn `http://` (cleartext), và bản web chạy trên `https://` không gọi được API `http://` (mixed content). Các dịch vụ cloud bên dưới đều cấp HTTPS sẵn.
- `EXPO_PUBLIC_API_URL` được **nhúng vào bundle lúc build**. Đổi URL backend thì phải build lại APK, hoặc phát hành bản sửa qua `eas update`.

### 3.2. Chọn nơi chạy backend + DB

| Phương án | Ưu điểm | Nhược điểm | Khi nào dùng |
| --- | --- | --- | --- |
| **A. Railway** (đề xuất): backend deploy từ Dockerfile trong repo, MariaDB cùng project | Một nơi quản lý cả hai, có HTTPS và biến môi trường, tự deploy khi push | Gói miễn phí/credit có giới hạn, cần kiểm tra giá hiện tại | Bản nộp chính |
| B. Render (Web Service từ Docker) + DB MariaDB ngoài (Railway, Aiven…) | Dễ dùng | Gói free ngủ khi không có truy cập, lần gọi đầu chậm; DB phải đăng ký riêng | Nếu Railway không dùng được |
| C. VPS (Docker Compose: backend + MariaDB + Caddy cho HTTPS) | Toàn quyền, không ngủ | Phải tự quản trị, cần tên miền | Nếu nhóm có sẵn VPS |
| D. Chạy trên laptop + Cloudflare Tunnel / ngrok | Nhanh nhất, miễn phí | Tắt máy là mất; URL ngẫu nhiên có thể đổi | **Phương án dự phòng** ngày demo |

> Trước khi tạo tài khoản, xem lại giá/gói miễn phí hiện tại của dịch vụ được chọn. Khánh chốt dịch vụ; không tạo gói trả phí khi chưa cả nhóm đồng ý.

### 3.3. Thay đổi code cần làm trước khi deploy

| Việc | File |
| --- | --- |
| ~~Sửa L1–L5 ở mục 2.1~~ ✅ Đã xong 26/11 | xem mục 2.2 |
| Thêm `Dockerfile` (multi-stage). Bước build: `maven:3.9-eclipse-temurin-17` chạy `mvn compile dependency:copy-dependencies -DincludeScope=runtime`. Image chạy: `eclipse-temurin:17-jre` với `java -cp "classes:lib/*" com.memestudy.backend.TomcatServer`. Copy thêm `src/main/webapp` và `database/memestudy_mariadb.sql`. | `Dockerfile` ở gốc repo, kèm `.dockerignore` loại trừ `node_modules`, `target`, `*.local.properties` và `.env` |
| `app.json`: thêm `android.package` (vd. `com.memestudy.app`) và `ios.bundleIdentifier` | `frontend/app.json` |
| Tạo `eas.json`. Profile `preview`: `distribution: internal`, `android.buildType: apk`, `env.EXPO_PUBLIC_API_URL = https://<backend>/api`, `EXPO_PUBLIC_USE_MOCK=false`. Profile `production` nếu cần. Profile `demo-mock` (`USE_MOCK=true`) làm bản dự phòng không cần server. | `frontend/eas.json` |
| `expo-updates` để dùng EAS Update (`npx expo install expo-updates`, `eas update:configure`) | `frontend/` |

### 3.4. Biến môi trường trên server

| Biến | Giá trị | Ghi chú |
| --- | --- | --- |
| `PORT` | do dịch vụ cấp | `TomcatServer` đã đọc sẵn |
| `DB_URL` | `jdbc:mariadb://<host>:<port>/memestudy?useUnicode=true&characterEncoding=UTF-8` | `DatabaseManager` đã đọc sẵn |
| `DB_USER`, `DB_PASSWORD` | lấy từ DB của dịch vụ | **Chỉ** đặt ở dashboard, không ghi vào file trong repo |
| `APP_ENV` | `production` | **Bắt buộc khi deploy**: đòi `JWT_SECRET`, đòi DB, chặn `mock-token` (L2–L4) |
| `JWT_SECRET` | chuỗi ngẫu nhiên ≥ 32 byte | L3. Tạo bằng `openssl rand -base64 48` hoặc trình tạo mật khẩu |
| `DB_INIT_SCRIPT` | `/app/database/memestudy_mariadb.sql` | L5 |
| `ALLOW_MOCK_TOKEN` | **không đặt** | Chỉ dùng ở máy khi cần test bằng `mock-token-N` |
| `GOOGLE_API_KEY` | key Gemini | Đã hỗ trợ. Nên tạo **key riêng cho server**, đặt giới hạn quota |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Không bắt buộc |
| `CORS_ORIGINS` | `https://<tên>.expo.app` | Mới (L6), không bắt buộc |

### 3.5. Các bước thực hiện

| Bước | Việc | Lệnh / thao tác | Người |
| --- | --- | --- | --- |
| 0 | Commit `docs/`, merge PR `Khanh-AI-Gemini-TaiDe` vào `main` | GitHub | Khánh |
| 1 | ~~Sửa L1–L5, test local~~ ✅ Đã xong 26/11; nhờ Thi đọc lại phần `ExamScreen` (Thi viết màn này) | — | Khánh |
| 2 | Viết `Dockerfile`, build và chạy thử ở máy: `docker build -t memestudy-api .` rồi `docker run -p 8090:8080 --env-file <file env local> memestudy-api` | Docker Desktop đã có trên máy Khánh | Khánh |
| 3 | Tạo project trên dịch vụ đã chọn: thêm DB, thêm service từ repo GitHub (Dockerfile), đặt biến ở 3.4, bật domain HTTPS | Dashboard dịch vụ | Khánh |
| 4 | Kiểm tra server: `GET https://<backend>/api/health`, đăng nhập 2 vai trò, nộp 1 bài, AI giải thích, tải đề (mục 3.6) | Postman CLI / `curl` | Khánh |
| 5 | EAS: `npx eas-cli@latest login`, `npx eas-cli@latest build:configure`, chỉnh `eas.json`, rồi `npx eas-cli@latest build -p android --profile preview` | `frontend/` | Khánh |
| 6 | Cài APK lên **điện thoại thật** từ link EAS, chạy hết luồng, chụp ảnh/quay video (đáp ứng luôn yêu cầu C2) | — | Cả hai |
| 7 | Bản web: `npx expo export --platform web` rồi `npx eas-cli@latest deploy --prod` (EAS Hosting). Sau đó đặt `CORS_ORIGINS` | `frontend/` | Thi |
| 8 | `npx expo install expo-updates` → `npx eas-cli@latest update:configure` → build lại APK một lần. Từ đó sửa JS chỉ cần `npx eas-cli@latest update --branch preview -m "..."` | `frontend/` | Khánh |
| 9 | README: link APK (trang build EAS), link web, link backend `/api/health`, tài khoản demo, ảnh chụp | `README.md` | Cả hai |
| 10 | Build thêm APK `demo-mock` làm bản dự phòng nếu server sập lúc chấm | `eas build --profile demo-mock` | Khánh |

Thứ tự gợi ý: bước 0–2 ngày 1; bước 3–5 ngày 2; bước 6–8 ngày 3; bước 9–10 ngày 4. Bước 1 có thể làm song song với C3/C5.

### 3.6. Smoke test sau mỗi lần deploy

1. `GET /api/health` trả 200 với `"database": "connected"`.
2. Đăng nhập học sinh; Trang chủ có vòng thi và đề giáo viên giao.
3. Làm và nộp một bài. **Tắt rồi mở lại app**, Lịch sử vẫn có bài vừa nộp (kiểm tra L1).
4. Hỏi Cú AI một câu sai: nhận được lời giải từ Gemini, không phải câu "chưa bật AI".
5. Đăng nhập giáo viên, tải một file đề mẫu, tạo đề, thấy đề bên học sinh, sau đó xoá đề.
6. Gọi API kèm `Authorization: Bearer mock-token-3` phải trả **401** (kiểm tra L2).
7. Xoay ngang điện thoại; mở bản web trên máy tính.

### 3.7. Rủi ro khi deploy

| Rủi ro | Cách xử lý |
| --- | --- |
| Server ngủ hoặc hết credit đúng lúc chấm | Bật server trước buổi chấm 10 phút; có APK `demo-mock` và phương án D (tunnel) |
| Gemini hết quota hoặc lỗi | Backend đã có lời giải có sẵn làm dự phòng; dùng key riêng cho server và theo dõi quota |
| Lộ key/mật khẩu | Chỉ đặt trong dashboard dịch vụ; `.dockerignore` loại trừ `*.local.properties` và `.env`; không dùng tiền tố `EXPO_PUBLIC_` cho bí mật |
| Đổi URL backend sau khi đã phát APK | Dùng domain cố định của dịch vụ; nếu buộc phải đổi thì `eas update` (bước 8) |
| Lỗi chỉ xuất hiện khi build release (font, ảnh, Reanimated) | Cài APK lên máy thật ngay ở bước 6, đừng để đến hôm nộp |

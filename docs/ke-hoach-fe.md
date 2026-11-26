# Kế hoạch FE còn lại — chia việc cho 2 người (Khánh & Thi)

> Cập nhật: 06/11/2026 · Thư mục: `frontend/` · Kế hoạch chung: [ke-hoach-tong-the.md](ke-hoach-tong-the.md)

## 0. Hiện trạng FE (đã làm)

- Expo SDK 57 + TypeScript + React Navigation 7. `RootNavigator` chọn `AuthStack` / `UserTabs` / `AdminStack` theo `user.role`.
- 10 màn: `auth/Login`, `auth/Register`, `user/Home`, `user/RoundList`, `user/Exam`, `user/Result`, `user/History`, `admin/Dashboard`, `admin/QuestionList`, `admin/ExamList`.
- Gọi API: `services/http.ts` (axios + Bearer + chuẩn hoá lỗi) → các service → tự chuyển sang `services/mock/` khi `EXPO_PUBLIC_USE_MOCK=true`.
- State server: **RTK Query** trong `store/api.ts`. Đăng nhập dùng `hooks/useAuth.tsx` (AuthContext).
- Màn **Exam** và **Result** theo Figma *Style A – Game hoá* (A3, A4): component trong `components/game/`, token trong `theme/game.ts`.
- **Đồ hoạ**: hình minh hoạ và icon màu (kể cả icon thanh tab, ngôi sao) là **Microsoft Fluent Emoji 3D** (MIT, PNG) trong `assets/emoji/`, dùng qua `<Emoji name="owl" size={96} />`; **Ionicons** chỉ cho ký hiệu nhỏ trong nút (play, ✓, ✕, đồng hồ). Nguồn và giấy phép ghi trong [`frontend/CREDITS.md`](../frontend/CREDITS.md).
- **Animation (FE-2) đã xong**: `src/components/motion.tsx` (Reanimated 4) — mascot nhấp nhô (`Float`), cá bơi (`Swim`), rong/san hô lắc (`Sway`), bong bóng trôi (`RiseFade`), nảy (`PopIn`, `Bounce`), phập phồng (`Pulse`), nhấn co lại (`usePressScale`), đếm số (`CountUp`), danh sách hiện lần lượt (`listEntering`). Tất cả tự tắt khi bật "Giảm chuyển động".
- Tài khoản mock: `user / 123456`, `admin / 123456`.

## 1. Quy ước chung (cả hai người)

1. Mỗi việc một nhánh từ `main` mới nhất (`khanh/<việc>`, `thi/<việc>`), mở PR nhỏ, người kia review trước khi merge.
2. Cài thư viện **luôn** bằng `npx expo install <tên>`.
3. API mới: service (+ bản mock) → endpoint trong `store/api.ts` (`providesTags` / `invalidatesTags`) → hook trong màn hình. Không gọi axios trực tiếp trong màn hình.
4. Types ở `src/types/`; màu, khoảng cách, font từ `src/theme/`.
5. **Đồ hoạ**: chỉ dùng nguồn miễn phí có giấy phép rõ ràng — ưu tiên Fluent Emoji **3D** (cùng phong cách tươi sáng, tải PNG gốc từ `https://github.com/microsoft/fluentui-emoji`, thư mục `assets/<Tên>/3D/`), Ionicons chỉ dùng cho ký hiệu nhỏ trong nút. Mỗi hình mới phải thêm một dòng vào `frontend/CREDITS.md` (file, nguồn, giấy phép, dùng ở đâu). Không lấy hình từ Google Images / Pinterest không rõ giấy phép.
6. Bám Figma *MeMeStudy* (trang "📱 Học sinh – 2 phong cách") để bố cục và màu "gần giống Figma".
7. **Màn mới** tái dùng hiệu ứng có sẵn trong `src/components/motion.tsx` (ví dụ thẻ danh sách `entering={listEntering(index)}`, mascot bọc `Float`) — không thêm thư viện animation khác.
8. **Xong một việc** khi: `npx tsc --noEmit` sạch, `npx expo export --platform android` và `--platform web` build được, chạy được ở chế độ mock, PR có ảnh chụp (dọc + ngang/tablet).

## 2. Bảng chia việc

| Mã | Việc | Người làm | Ưu tiên | Màn mới | Ước lượng |
| --- | --- | --- | --- | --- | --- |
| FE-3 | Tích hợp TamaGUI + chuyển component dùng chung | **Thi** | Cao (đề bắt buộc) | — | 2 ngày |
| FE-1 | Responsive: xoay ngang + tablet/iPad | **Thi** | Cao (đề bắt buộc) | — | 1.5 ngày |
| FE-2 | Animation basic | ✅ Đã làm | Cao (đề bắt buộc) | — | — |
| FE-6 | Hồ sơ cá nhân (tab "Cá nhân") | **Thi** | Trung bình | 1 | 0.5 ngày |
| FE-8 | Home & RoundList theo Figma Style A (A1, A2) | **Thi** | Thấp | — | 1.5 ngày |
| FE-4 | Admin: thêm/sửa/xoá câu hỏi và đề thi | **Khánh** | Cao | 2 | 2 ngày |
| FE-5 | Ôn lại câu sai | **Khánh** | Trung bình | 1 | 1 ngày |
| FE-7 | AI basic (giải thích câu sai) | ✅ Đã làm 25/11 (Khánh) | Cao (đề bắt buộc) | — | — |
| FE-9 | Kiểm tra máy thật + lint | **Cả hai** | Cao | — | 0.5 ngày |

**Lý do chia như vậy**
- **Thi** lo phần *nền tảng giao diện* (Tamagui, responsive, giao diện các màn có sẵn): đụng nhiều file dùng chung, nên một người làm để tránh xung đột.
- **Khánh** lo các *tính năng gắn với backend* (CRUD admin, ôn câu sai, AI): Khánh cũng viết API backend tương ứng nên tự nối FE ↔ BE nhanh hơn.
- Sau khi FE-2 đã làm xong: Thi khoảng **5.5 ngày công FE**, Khánh khoảng **6 ngày công FE** + backend (theo kế hoạch tổng thể). Không giao thêm việc mới cho Thi.
- Sau FE-4 → FE-7 app có **14 màn** (đạt yêu cầu 10–15).

## 3. Thứ tự & phối hợp

| Tuần | Thi | Khánh |
| --- | --- | --- |
| 1 | **FE-3 Tamagui trước tiên** (component dùng chung: `Button`, `Card`, `TextField`, `Screen`, `LoadingView`, `ErrorView`) → merge sớm. Sau đó FE-1 Responsive. | Backend: auth, rounds, attempts (xem kế hoạch tổng thể). FE-4 phần **không có UI**: types, service, mock, mutation trong `store/api.ts`. |
| 2 | FE-6 Hồ sơ, bắt đầu FE-8 nếu kịp. | FE-4 giao diện (dùng component Tamagui Thi đã merge), FE-5 Ôn lại câu sai. |
| 3 | FE-8 (nếu còn thời gian), bản web, FE-9. | FE-7 AI, FE-9, build EAS. |

**Điểm phối hợp cần chú ý**
- Khánh **chờ** Thi merge FE-3 (Tamagui) rồi mới viết giao diện màn mới, để không phải viết lại.
- FE-1 (Thi) sửa layout `ExamScreen` / `ResultScreen`; FE-5 (Khánh) thêm nút vào `ResultScreen` → Khánh rebase sau khi FE-1 merge.
- `components/game/*` và `components/motion.tsx` đã có hiệu ứng; ai sửa các file này thì báo người kia để tránh xung đột.
- `store/api.ts`, `types/`, `services/` chủ yếu do Khánh sửa; Thi cần endpoint mới (ví dụ FE-6 dùng lại `useGetMyResultsQuery`) thì báo trước.

---

## 4. Việc của Thi

### FE-3 · Tích hợp TamaGUI (đề bắt buộc) — làm đầu tiên

- Đọc docs cài Tamagui cho Expo; **kiểm tra trước** phiên bản hỗ trợ Expo SDK 57 / React 19.2 / RN 0.86. Nếu không tương thích, báo nhóm chốt phương án.
- Tạo `frontend/tamagui.config.ts` lấy token từ `src/theme` (colors, spacing, radius, font) để hai hệ thống dùng chung bộ màu.
- Bọc `TamaguiProvider` trong `src/App.tsx`.
- Chuyển các component dùng chung sang Tamagui, **giữ nguyên props** để màn hình không phải sửa: `Button`, `Card`, `TextField`, `Screen`, `LoadingView`, `ErrorView`. Các màn auth, Home, RoundList, History, admin dùng `YStack`, `XStack`, `Text`, `Input`…
- **Giữ** `components/game/*` bằng StyleSheet (cần vẽ chính xác theo Figma) — ghi rõ lý do trong README.
- Kiểm tra build web + android sau khi thêm babel/metro plugin của Tamagui.

### FE-1 · Responsive (xoay ngang, tablet/iPad)

- `app.json`: `"orientation": "portrait"` → `"default"`.
- Tạo `src/hooks/useResponsive.ts` (`useWindowDimensions()`) trả `{ width, height, isLandscape, isTablet, columns }` (tablet khi cạnh ngắn ≥ 600).
- Danh sách (`RoundList`, `History`, `QuestionList`, `ExamList`): `FlatList` `numColumns={columns}` (đổi `key` khi đổi số cột).
- `ExamScreen` nằm ngang: bảng câu hỏi bên trái, bạch tuộc + bong bóng + nút "Trả lời" bên phải; nền biển (`OceanBackground`) vẫn bám mép dưới.
- `ResultScreen` nằm ngang: cú mèo + bảng điểm bên trái, "Câu cần ôn lại" + nút bên phải.
- Kiểm tra: điện thoại dọc/ngang, tablet (emulator Pixel Tablet / iPad simulator), web thu/phóng cửa sổ.

### FE-2 · Animation basic — ✅ đã làm (không còn là việc của Thi)

- Thư viện: `react-native-reanimated` 4.5.1 + `react-native-worklets` 0.10.1 (`babel-preset-expo` tự bật plugin, không cần `babel.config.js`).
- Đã có: Login (cú mèo nhấp nhô, ✨ lấp lánh), LoadingView (cú mèo thay vòng xoay), thanh tab (icon nảy khi chọn), Home/RoundList/History/Dashboard (thẻ hiện lần lượt), Exam (bạch tuộc nhấp nhô, cá bơi, bong bóng trôi, rong/san hô lắc, câu hỏi trượt vào, đồng hồ ≤ 60s phập phồng, nút co khi nhấn, đáp án nảy khi chọn, nút "Trả lời" phập phồng mời bấm), Result (confetti rơi, cú mèo nảy vào, 3 sao nảy lần lượt, điểm đếm tăng).
- Nếu web báo lỗi `useAnimatedStyle was used without ... Babel plugin`: chạy lại `npx expo start -c` để xoá cache Metro.

### FE-6 · Hồ sơ cá nhân (+1 màn)

- Thêm tab "Cá nhân" trong `navigation/UserTabs.tsx` → `screens/user/ProfileScreen.tsx`: họ tên, tên đăng nhập, vai trò, số lượt thi, điểm trung bình (từ `useGetMyResultsQuery`), nút đăng xuất (chuyển từ Home sang).
- Hình đại diện dùng Fluent Emoji (ví dụ 🦉 hoặc 🧑‍🎓), thêm vào `CREDITS.md`.

### FE-8 · Home & RoundList theo Figma Style A (ưu tiên thấp)

- Figma: `A1 · Trang chủ học sinh`, `A2 · Kho đề & tài liệu được giao`.
- Tái sử dụng `components/game/*` và `theme/game.ts`; hình minh hoạ (mây, cây, lâu đài…) thay bằng Fluent Emoji tương ứng (☁️ Cloud, 🌳 Deciduous tree, 🏰 Castle…) — ghi nguồn vào `CREDITS.md`.
- Phần thiết kế có mà dữ liệu chưa có (sao thưởng, chuỗi ngày, tài liệu phụ huynh gửi…) thì bỏ qua hoặc hỏi lại nhóm, không làm giả số liệu.
- Bản web: `npx expo export --platform web` rồi host (EAS Hosting / Netlify / Vercel).

---

## 5. Việc của Khánh

### FE-4 · Admin: CRUD câu hỏi & đề thi (+2 màn)

- API (Khánh viết luôn ở backend): `POST/PUT/DELETE /questions`, `POST/PUT/DELETE /rounds`.
- FE: thêm hàm vào `questionService`, `roundService` + mock; mutation trong `store/api.ts` với `invalidatesTags` `Question` / `Round`.
- `screens/admin/QuestionFormScreen.tsx`: nội dung, 2–6 đáp án (thêm/xoá dòng), chọn đáp án đúng, validate.
- `screens/admin/RoundFormScreen.tsx`: tên, mô tả, thời gian (phút), chọn câu hỏi, công tắc mở/đóng.
- `QuestionList` / `ExamList`: nút "Thêm", chạm dòng → sửa, nút xoá (`utils/confirm.ts`). Thêm route vào `AdminStackParamList` và `AdminStack.tsx`.

### FE-5 · Ôn lại câu sai (+1 màn)

- API: `GET /attempts/{id}/review` → `[{ questionId, content, choices, selectedChoiceId, correctChoiceId }]` (+ type, service, mock, query).
- `screens/user/ReviewScreen.tsx`: mỗi câu hiện đáp án đã chọn và đáp án đúng (trạng thái Correct/Wrong — tham khảo `Clean/Option` và màn B4 trong Figma).
- `ResultScreen`: thêm nút "Ôn lại câu sai" (như Figma A4); chạm chip "Câu 3" → mở review tại câu đó.

### FE-7 · AI basic — ✅ đã làm 25/11

> Đã làm phần "giải thích câu sai": nút **"Hỏi Cú AI vì sao sai?"** trong thẻ câu sai ở màn Kết quả → `POST /api/ai/explain` → Claude (backend Java). Cách hoạt động, cách bật API key và hướng dẫn trình bày: [`docs/ai-basic.md`](ai-basic.md). Phần "tạo câu hỏi bằng AI" cho admin bên dưới là mở rộng tuỳ chọn, chưa làm.

Kế hoạch ban đầu:

- API backend: `POST /ai/explain { questionId, selectedChoiceId }` và `POST /ai/generate-questions { text, count }`. API key chỉ ở backend (biến môi trường), **không** đưa vào `.env` của FE.
- User: nút "Giải thích bằng AI" trong `ReviewScreen` (trạng thái đang tải / lỗi / thử lại).
- Admin: `screens/admin/AiQuestionScreen.tsx` — dán văn bản → sinh câu hỏi → xem trước → chọn và lưu (dùng mutation tạo câu hỏi của FE-4).
- Mock: trả lời mẫu cố định để demo khi chưa có backend.

---

## 6. Việc chung — FE-9 · Máy thật & lint

- `npx expo start` → Expo Go trên điện thoại cùng Wi-Fi; backend thật thì đặt `EXPO_PUBLIC_API_URL=http://<IP-LAN>:8080/api` trong `frontend/.env`.
- Kiểm tra: đăng nhập, làm bài đến hết giờ (tự nộp), nút back cứng Android khi đang thi (phải hỏi "Thoát bài thi?"), xoay màn hình, bàn phím.
- `npx expo lint` (lần đầu tự cài ESLint) và sửa hết cảnh báo; `npx expo-doctor` không còn lỗi.
- Mỗi người test trên ít nhất 1 thiết bị thật của mình (Android/iOS) và ghi lỗi vào issue GitHub.

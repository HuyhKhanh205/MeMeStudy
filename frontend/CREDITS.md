# Nguồn đồ hoạ, icon và font (trích nguồn)

Mọi tài nguyên đồ hoạ trong app đều lấy từ bộ miễn phí có giấy phép cho phép dùng trong dự án (kể cả thương mại), ghi rõ nguồn dưới đây.
Bố cục, màu sắc và cách sắp xếp màn hình theo file thiết kế Figma của nhóm: **MeMeStudy** (trang "📱 Học sinh – 2 phong cách", frame *A3 · Làm bài* và *A4 · Kết quả & phần thưởng*).

## 1. Hình minh hoạ & icon màu — Microsoft Fluent Emoji (kiểu 3D)

- **Nguồn**: https://github.com/microsoft/fluentui-emoji
- **Tác giả**: Microsoft Corporation
- **Giấy phép**: MIT — bản đầy đủ ở [`assets/emoji/LICENSE`](assets/emoji/LICENSE)
- **Cách lấy**: tải file PNG 256×256 gốc, không chỉnh sửa (chỉ bỏ hậu tố `_3d` trong tên file), từ `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Tên>/3D/<tên>_3d.png` (ngày 06/11/2026)
- **Thư mục trong dự án**: `assets/emoji/` · khai báo trong `src/components/emojiAssets.ts`

| File (`assets/emoji/`) | Emoji gốc | Dùng ở |
| --- | --- | --- |
| `assets/emoji/owl.png` | 🦉 Owl | Login, Home, avatar tròn màn Hồ sơ cá nhân (`ProfileScreen`), trạng thái trống, mascot màn Kết quả |
| `assets/emoji/graduation_cap.png` | 🎓 Graduation cap | Icon tab "Cá nhân" (`UserTabs`), mũ tốt nghiệp của avatar Hồ sơ cá nhân (`ProfileScreen`) và mascot màn Kết quả |
| `assets/emoji/octopus.png` | 🐙 Octopus | Mascot màn Làm bài (`ExamScreen`) |
| `assets/emoji/tropical_fish.png` | 🐠 Tropical fish | Trang trí nền biển (màn Làm bài) |
| `assets/emoji/fish.png` | 🐟 Fish | Trang trí nền biển (lật ngang) |
| `assets/emoji/coral.png` | 🪸 Coral | Trang trí đáy biển |
| `assets/emoji/herb.png` | 🌿 Herb | Rong biển ở đáy biển (thay rong trong Figma) |
| `assets/emoji/spiral_shell.png` | 🐚 Spiral shell | Đáy biển (thay rương báu trong Figma) |
| `assets/emoji/memo.png` | 📝 Memo | Thẻ "Ôn theo vòng" & modal chủ đề ở `HomeScreen` (`PracticeCard`), icon tab "Vòng thi", thống kê "Số lượt thi" ở `ProfileScreen`, `HistoryScreen` |
| `assets/emoji/trophy.png` | 🏆 Trophy | Huy hiệu vòng hoàn thành ở `RoundListScreen`, icon tab "Lịch sử", thống kê "Điểm trung bình" ở `ProfileScreen`, `HistoryScreen` |
| `assets/emoji/party_popper.png` | 🎉 Party popper | Chủ đề Listening ở `HomeScreen`, thẻ tổng kết lượt thi ở `ProfileScreen`, `HistoryScreen` |
| `assets/emoji/books.png` | 📚 Books | Vòng thi đang mở ở `RoundListScreen`, chủ đề Từ vựng ở `HomeScreen`, minh hoạ câu hỏi IMAGE |
| `assets/emoji/locked.png` | 🔒 Locked | Vòng thi chưa mở ở `RoundListScreen` |
| `assets/emoji/red_question_mark.png` | ❓ Red question mark | Dashboard admin — số câu hỏi |
| `assets/emoji/clipboard.png` | 📋 Clipboard | Dashboard admin — số vòng thi |
| `assets/emoji/hourglass_not_done.png` | ⏳ Hourglass not done | Dashboard admin — vòng đang mở |
| `assets/emoji/house.png` | 🏠 House | Icon tab "Trang chủ" (`UserTabs`), minh hoạ câu hỏi IMAGE |
| `assets/emoji/star.png` | ⭐ Star | Thẻ "Luyện theo chủ đề" & chủ đề Hình ảnh ở `HomeScreen` (`PracticeCard`), ngôi sao ở thanh tiến trình, thanh thông tin, 3 sao màn Kết quả |
| `assets/emoji/sparkles.png` | ✨ Sparkles | Hai bên tên app ở màn Login và hai bên họ tên ở màn Hồ sơ cá nhân (`ProfileScreen`) |

## 2. Icon giao diện — Ionicons (qua `@expo/vector-icons`)

- **Nguồn**: https://ionic.io/ionicons · https://github.com/expo/vector-icons
- **Giấy phép**: MIT (Ionicons © Ionic; `@expo/vector-icons` © 650 Industries, © Joel Arvidsson)
- **Dùng cho**: ký hiệu nhỏ nằm trong nút theo Figma — play, quay lại, đóng, dấu ✓/✕ ở đáp án và chip kết quả, đồng hồ.

## 3. Font chữ — Google Fonts (qua `@expo-google-fonts`)

| Font | Tác giả | Giấy phép | Nguồn |
| --- | --- | --- | --- |
| Baloo 2 ExtraBold | The Baloo 2 Project Authors (Ek Type) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Baloo+2 |
| Nunito Bold / ExtraBold | The Nunito Project Authors | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Nunito |

## 4. Phần vẽ bằng code (không dùng file ảnh)

Nền gradient, tia sáng, bong bóng nước, đồi cát/đồi cỏ (`components/game/Ellipse.tsx`), confetti, bảng gỗ, nút 3D, nền tròn pastel sau emoji (`components/EmojiBadge.tsx`) — đều vẽ bằng `View` + `expo-linear-gradient` theo màu và kích thước lấy từ Figma của nhóm.

Toàn bộ chuyển động (mascot nhấp nhô, cá bơi, bong bóng trôi, confetti rơi, sao nảy…) do nhóm tự viết trong `components/motion.tsx`, dùng thư viện `react-native-reanimated` (MIT, Software Mansion).

## 5. Ảnh nền (Background Asset)

- `assets/background/Home.png`: Ảnh nền bầu trời, mây và đồi cỏ của dự án nhóm, dùng làm `ImageBackground` cho các màn hình học sinh (`HomeScreen`, `RoundListScreen`, `HistoryScreen`, `ResultScreen`).

---

Khi thêm hình mới: ưu tiên Fluent Emoji **3D** (cùng phong cách tươi sáng), tải PNG gốc vào `assets/emoji/`, khai báo trong `emojiAssets.ts` và **bổ sung một dòng vào bảng trên**.

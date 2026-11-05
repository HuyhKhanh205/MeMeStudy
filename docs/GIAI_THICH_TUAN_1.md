# TÀI LIỆU GIẢI THÍCH TUẦN 1 - DỰ ÁN MEMESTUDY

> **Dành cho sinh viên (Thi - Người 2)** bảo vệ và giải thích chi tiết toàn bộ giao diện, component và luồng dữ liệu của ứng dụng MeMeStudy.

---

## 1. TỔNG QUAN THIẾT KẾ & GIAO DIỆN (THEO BỘ ẢNH CHUẨN)

Ứng dụng **MeMeStudy** được xây dựng theo phong cách **Gamified Edu-App** (Ứng dụng học tập kết hợp trò chơi hóa) dành cho học sinh tiểu học luyện thi IOE và ôn luyện tiếng Anh:
- **Phong cách visual:** 3D Playful UI (các nút bấm nổi có gờ bóng đáy 3–4px dạng tactile Duolingo/Brawl Stars), bo góc tròn lớn mềm mại, thẻ bài viền gỗ be ấm áp.
- **Linh vật (Mascots):** 
  - **Bé Cú Xanh (Owl Mascot):** Đội mũ cử nhân tốt nghiệp, mắt to tri thức, xuất hiện ở Trang chủ (Màn 1), Kho đề ôn (Màn 2) và Màn Kết quả (Màn 4) với các bong bóng lời thoại (Speech Bubble) động viên.
  - **Bé Bạch Tuộc Hồng (Pink Octopus):** Xuất hiện dưới đáy đại dương ở Màn Làm bài (Màn 3) cùng rương kho báu vàng.
- **Bảng màu chủ đạo:**
  - Nền trời: `#CDEEFE` (xanh da trời pastel dịu mắt).
  - Nền đại dương: `#2980B9` (xanh biển sâu sinh động).
  - Nền kết quả: `#FEF9E7` (vàng kem ấm áp kèm pháo giấy confetti).
  - Nút cam 3D: Mặt `#FF8C00`, viền đáy 3D `#D66A00`.
  - Nút xanh lá 3D: Mặt `#2ECC71`, viền đáy 3D `#239B56`.
  - Nút đỏ san hô 3D: Mặt `#FF4D6D`, viền đáy 3D `#C70039`.

---

## 2. CHI TIẾT 5 MÀN HÌNH CHÍNH & COMPONENT DÙNG CHUNG

### Màn 1: Trang chủ (`HomeScreen.tsx`)
- **Header:** Logo uốn lượn `MeMeStudy`, slogan "Học vui - Ôn tốt - Cùng MeMe!", Avatar học sinh "MA" (Minh Anh), nút bánh răng cài đặt.
- **Thẻ Sao & Chuỗi ngày (Streak):** `120 sao • 5 ngày liên tiếp` tạo động lực học hàng ngày.
- **Bé Cú Xanh & Lời nhắn:** "Cô Lan vừa giao 2 đề mới. Cùng tớ ôn nào!".
- **Nút 3D "Bắt đầu ôn tập":** Nút cam 3D to bản có icon Play tròn trắng bên trái.
- **Section "Hành trình ôn tập" (Ảnh 2):** 3 thẻ màu sắc:
  1. *Thẻ xanh lá:* Đề kiểm tra (Giáo viên giao) • 3/10 đề • icon sách.
  2. *Thẻ tím pastel:* Tài liệu ôn (PDF + Word + Ảnh) • 5 mới • icon tập giấy.
  3. *Thẻ cam:* Luyện nghe (Audio bài học) • 3/10 đề • icon tai nghe.
- **Section "Mới từ thầy cô & bố mẹ" (Ảnh 5):** Thẻ bài tập "Đề ôn Unit 5 – My hobbies" (PDF, Cô Lan, 20 câu, hạn 30/10) kèm nút xanh lá 3D "Ôn ngay".
- **Footer:** Thẻ Thành tích (120/500 sao) và Quà hôm nay (4/5 sao).

### Màn 2: Kho đề ôn (`PracticeListScreen.tsx`)
- **Header:** Nút Back tròn xanh, Capsule gỗ nâu "Kho đề ôn", Nút Search cam.
- **Filter Pills:** "Tất cả" (cam active), "Đề thi", "Tài liệu", "Audio".
- **Phân nhóm người giao:**
  - *Nhóm Cô Lan - Lớp 5A (Badge "2 đề mới"):* Gồm đề Unit 5 (PDF) và Kiểm tra giữa kì Toán 5 (DOCX) có nút "Làm bài".
  - *Nhóm Mẹ Hoa gửi (Badge "Mới"):* Luyện nghe Daily routines (MP3) nút "Nghe", Phiếu từ vựng tuần 8 (Ảnh) nút "Xem".
- **Footer:** Cú Xanh nhắc: "Còn 2 đề sắp đến hạn, cố lên nhé!".

### Màn 3: Màn làm bài trắc nghiệm / Luyện nghe (`ExamScreen.tsx`)
- **Chủ đề đại dương:** Nền xanh biển sâu, chuỗi bóng tròn tiến độ (Ocean Stepper) với câu 1, 2 đã hoàn thành (xanh check), câu 3 đang làm (vàng), đích đến là ngôi sao vàng.
- **Capsule thông số:** ⏱ 00:32 | ⭐ Điểm: 20 | Câu 3/10.
- **Thẻ câu hỏi lớn bo tròn:**
  - Icon loa xanh lớn: "Listen to the audio and choose True or False."
  - Hàng câu thoại: "The cat is sleeping."
  - **AudioWaveVisualizer:** Thanh sóng âm dao động mô phỏng âm thanh đang phát.
  - **Cặp nút True / False 3D (Ảnh 4):**
    - Nút True xanh lá 3D với hình tròn trắng chứa dấu tích xanh.
    - Nút False đỏ san hô 3D với hình tròn trắng chứa dấu X đỏ.
    - Hỗ trợ câu trắc nghiệm A/B/C/D 3D.
- **Đáy biển:** Bé Bạch Tuộc Hồng ("Nghe kỹ nhé, bạn làm được mà!"), rương kho báu vàng, nút 3D "Trả lời".

### Màn 4: Màn Kết quả (`ResultScreen.tsx`)
- **Header:** Nút đóng tròn đỏ, Capsule "Kết quả", pháo giấy Confetti bay khắp màn hình.
- **Bé Cú Xanh dang rộng cánh** mừng chiến thắng.
- **Thẻ kết quả màu be viền gỗ:**
  - Dòng chữ cam: "Hoàn thành xuất sắc!"
  - 3 Ngôi sao đánh giá (2 sao vàng lấp lánh, 1 sao viền).
  - Điểm to bản: **8/10 câu đúng**.
  - Viên thuốc chi tiết: ⏱ 12:40 | ✔ Đúng 8 | ✖ Sai 2.
  - Thưởng: ⭐ +80 sao thưởng.
- **Section "Câu cần ôn lại":** Các viên thuốc đỏ "Câu 3 - Từ vựng", "Câu 7 - Nghe".
- **Nút 3D "Ôn lại câu sai"** & Link "Về trang chủ".

### Màn 5: Góc bố mẹ (`ParentZoneScreen.tsx`)
- **Tab Switch:** "Thầy cô" | "Bố mẹ" (tab Bố mẹ cam nổi bật).
- **Vùng tải tài liệu (Khung nét đứt):** Icon đám mây cam, hỗ trợ "Chụp ảnh", "Chọn file", "Ghi âm".
- **Danh sách "Đã tải lên":** Hiển thị file MP3 đã tải xong (nút Sửa), Phiếu từ vựng đang tải 64% (nút Huỷ).
- **Form giao bài:** Dropdown "Minh Anh (con)", Datepicker "30/10/2026".
- **Nút cam 3D:** "Gửi cho con".

---

## 3. CÁC COMPONENT DÙNG CHUNG ĐẶC TRƯNG (`src/components/`)

1. **`PlayfulButton.tsx` (Nút 3D Tactile):**
   - Sử dụng 2 lớp: `shadowLayer` (nằm dưới tạo độ dày 3D) và `faceLayer` (mặt nút trên).
   - Khi nhấn (`onPressIn`), `faceLayer` dịch chuyển xuống (`translateY: 3px`) tạo cảm giác bấm phím xúc giác thực sự như phím cơ.
   - Hỗ trợ icon Play trong vòng tròn trắng (như Ảnh 3).
2. **`OptionButton.tsx` (Ảnh 4):**
   - Tạo nút True (xanh lá) và False (đỏ hồng) với vòng tròn trắng chứa icon chuẩn xác.
3. **`LearningJourneyCard.tsx` (Ảnh 2):**
   - Thẻ hiển thị hành trình học tập với badge số thứ tự, capsule icon đếm đề và nút tròn mũi tên.
4. **`AssignmentCard.tsx` (Ảnh 5):**
   - Thẻ bài tập với ô vuông loại file (PDF, DOCX, MP3, ẢNH) và nút 3D hành động.
5. **`CapsuleHeader.tsx`:**
   - Header hình viên thuốc gỗ nâu viền vàng đặc trưng cho app game giáo dục.
6. **`MascotBubble.tsx`:**
   - Vẽ vector linh vật Bé Cú và Bé Bạch Tuộc kèm bong bóng lời thoại (Speech bubble) có đuôi nhọn.
7. **`OceanStepper.tsx`:**
   - Chuỗi bóng tròn tiến độ bài thi kết nối liên tiếp dẫn đến ngôi sao vàng.
8. **`AudioWaveVisualizer.tsx`:**
   - Hiển thị sóng âm audio tương tác khi phát bài nghe tiếng Anh.

---

## 4. BỘ CÂU HỎI VẤN ĐÁP CỦA GIẢNG VIÊN & CÂU TRẢ LỜI MẪU

### Câu 1: Em đã tạo hiệu ứng nút bấm nổi 3D (PlayfulButton) như thế nào mà không cần dùng ảnh cắt sẵn?
**Trả lời mẫu:**
> *"Dạ thưa Thầy/Cô, em dùng kỹ thuật xếp chồng 2 lớp View trong React Native:*
> *1. Lớp đáy (`shadowLayer`) có màu tối hơn (ví dụ cam đậm `#D66A00`) được đặt cố định phía dưới.*
> *2. Lớp mặt (`faceLayer`) có màu tươi sáng (`#FF8C00`), có viền trên sáng màu.*
> *Khi người dùng nhấn vào nút (`onPressIn`), em dùng thuộc tính `transform: [{ translateY: 3 }]` để đẩy mặt nút thụt xuống khớp với lớp đáy. Khi nhả tay ra (`onPressOut`), mặt nút nảy lại vị trí cũ. Cách này giúp nút bấm nhẹ, mượt mà trên cả iOS và Android mà không tốn dung lượng tải ảnh."*

### Câu 2: Vì sao dự án sử dụng TanStack Query thay vì chỉ dùng `useEffect` + `axios` thông thường?
**Trả lời mẫu:**
> *"Dạ thưa Thầy/Cô, TanStack Query mang lại các ưu điểm vượt trội:*
> *1. **Tự động quản lý vòng đời dữ liệu:** Cung cấp sẵn các trạng thái `isLoading`, `isError`, `data` mà không cần viết nhiều `useState` thủ công.*
> *2. **Cơ chế Caching thông minh:** Dữ liệu sau khi fetch sẽ được lưu trong cache, người dùng chuyển qua lại giữa các màn hình thì giao diện hiển thị ngay lập tức mà không phải chờ tải lại.*
> *3. **Refetch & Invalidation:** Khi học sinh nộp bài hoặc phụ huynh giao bài mới, TanStack Query tự động làm mới danh sách bài tập mà không cần reload toàn bộ app."*

### Câu 3: Màn hình Exam (Màn 3) đang quản lý việc chọn đáp án và chuyển câu như thế nào?
**Trả lời mẫu:**
> *"Dạ, em dùng `useState` lưu một dictionary `selectedAnswers: { [questionId]: answer }`.*
> *Khi học sinh chọn True hoặc False (hoặc A/B/C/D), câu trả lời được ghi nhận vào map theo `questionId` của câu hiện tại. Nhờ lưu theo ID câu hỏi, kể cả khi học sinh quay lại câu trước thì đáp án đã chọn vẫn được bảo toàn nguyên vẹn."*

### Câu 4: Ứng dụng đã xử lý Responsive và xoay ngang / Tablet như thế nào?
**Trả lời mẫu:**
> *"Dạ, trong file `app.json`, nhóm đã thiết lập `"orientation": "default"` và `"supportsTablet": true`. Tất cả các kích thước đều dùng tỷ lệ tương đối (`flex`, `paddingHorizontal`, `width: '100%'`, cuộn qua `ScrollView`), bọc trong `SafeAreaView` để không bị tai thỏ hay thanh điều hướng che khuất trên mọi kích cỡ màn hình."*


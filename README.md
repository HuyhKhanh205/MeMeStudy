# MeMeStudy - Ứng dụng Ôn tập & Mô phỏng thi IOE Tiếng Anh

Ứng dụng ôn luyện tiếng Anh và thi IOE dành cho học sinh tiểu học với giao diện **Gamified 3D Playful UI** sinh động, thân thiện, kết hợp mascot Bé Cú Xanh và Bé Bạch Tuộc Hồng.

---

## 1. Cấu trúc Repository

```
MeMeStudy/
├── frontend/                # Ứng dụng Expo React Native duy nhất
│   ├── src/
│   │   ├── components/      # PlayfulButton 3D, OptionButton, LearningJourneyCard, AssignmentCard...
│   │   ├── screens/         # HomeScreen, PracticeListScreen, ExamScreen, ResultScreen, ParentZoneScreen...
│   │   ├── navigation/      # RootNavigator, types.ts
│   │   ├── theme/           # colors.ts, shadows
│   │   ├── services/        # Axios API client
│   │   ├── hooks/           # TanStack Query hooks
│   │   └── utils/           # mockData.ts
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── backend/                 # Java 17/21 + Jakarta EE 10 + Jersey + JPA/Hibernate (Maven)
│   ├── pom.xml
│   ├── mvnw.cmd
│   └── src/main/java/com/memestudy/backend/
├── docs/                    # GIAI_THICH_TUAN_1.md, api.md, architecture.md
└── README.md
```

---

## 2. Hướng dẫn chạy dự án

### A. Chạy Frontend (Expo Mobile App)

1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc (nếu chưa có):
   ```bash
   npm install
   ```
3. Khởi động ứng dụng Expo:
   ```bash
   npx expo start
   ```
4. Mở app **Expo Go** trên điện thoại thật (cùng mạng Wi-Fi với máy tính) và quét mã QR hiển thị trên màn hình terminal để trải nghiệm trực tiếp!

### B. Chạy Backend (Java Jakarta EE 10 + Maven)

1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Biên dịch và đóng gói WAR:
   ```bash
   .\mvnw.cmd clean package
   # Hoặc nếu máy đã có Maven trong PATH:
   mvn clean package
   ```
3. Chạy server bằng Jetty EE10 Plugin:
   ```bash
   .\mvnw.cmd org.eclipse.jetty.ee10:jetty-ee10-maven-plugin:12.0.14:run
   ```
4. Kiểm tra endpoint Health:
   ```bash
   curl http://localhost:8080/api/health
   ```

---

## 3. Các màn hình đã hoàn thành trong Tuần 1

1. **Trang chủ (`HomeScreen`)**: Header MeMeStudy, Thẻ Sao & Streak, Bé Cú Xanh động viên, Nút 3D "Bắt đầu ôn tập", Hành trình ôn tập (3 thẻ: Đề kiểm tra, Tài liệu ôn, Luyện nghe), Thẻ bài tập từ thầy cô & bố mẹ, Footer thành tích & quà hôm nay.
2. **Kho đề ôn (`PracticeListScreen`)**: Bộ lọc phân loại (Tất cả, Đề thi, Tài liệu, Audio), danh sách đề giao từ Cô Lan (Lớp 5A) và Mẹ Hoa gửi.
3. **Màn làm bài (`ExamScreen`)**: Chủ đề đại dương, Ocean Stepper chuỗi bóng tiến độ, Capsule thông số (Thời gian, Điểm, Câu x/10), khung câu hỏi nghe với sóng âm Audio Visualizer, 2 nút True / False 3D bóng bẩy, Bé Bạch Tuộc Hồng, rương kho báu vàng và nút 3D "Trả lời".
4. **Màn Kết quả (`ResultScreen`)**: Confetti pháo giấy rực rỡ, Bé Cú cử nhân ăn mừng, Thẻ kết quả gỗ be (Hoàn thành xuất sắc, 3 sao, điểm 8/10, thời gian 12:40, Đúng 8, Sai 2, +80 sao thưởng), Thẻ câu cần ôn lại và nút 3D "Ôn lại câu sai".
5. **Góc bố mẹ (`ParentZoneScreen`)**: Chuyển đổi tab Thầy cô / Bố mẹ, vùng tải đề nét đứt với Chụp ảnh/Chọn file/Ghi âm, danh sách file đã tải lên, form giao bài cho con và nút 3D "Gửi cho con".
6. **Hồ sơ học sinh (`ProfileScreen`)**: Thông tin bé Minh Anh, sao tích lũy và chuỗi ngày học liên tiếp.

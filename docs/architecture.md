# Kiến trúc MeMeStudy

```
┌──────────────────────┐      ┌──────────────────────┐
│ frontend/user (Expo) │      │ frontend/admin (Vite)│
│  src/services/*.ts   │      │  src/services/*.ts   │
└──────────┬───────────┘      └──────────┬───────────┘
           │        HTTP JSON (/api)     │
           └──────────────┬──────────────┘
                          ▼
              ┌───────────────────────┐
              │ backend (Express)     │
              │ routes → controllers  │
              │   → services → models │
              └───────────────────────┘
```

## Backend

Luồng xử lý một request:

1. `routes/` — khai báo endpoint, gắn middleware (ví dụ `validateBody` dùng schema trong `validators/`).
2. `controllers/` — đọc request, gọi service, trả response dạng `{ data: ... }`.
3. `services/` — nghiệp vụ (ví dụ tách nội dung tài liệu thành flashcard).
4. `models/` — kiểu dữ liệu và kho lưu trữ. Hiện tại dùng bộ nhớ trong (`models/store.ts`), dữ liệu mất khi khởi động lại server.
5. `middleware/` — xử lý lỗi (`HttpError`, `errorHandler`, `notFound`) và validate.

## Mô hình dữ liệu

- **Course** → nhiều **Unit** (chương) → nhiều **Lesson** (bài học, có `xp`) → nhiều **Exercise** (hiện hỗ trợ `multiple_choice`).
- **StudyFile** — tài liệu người học tự thêm. Mỗi dòng nội dung dạng `câu hỏi - đáp án` được chuyển thành một **Flashcard**.

## Hướng phát triển tiếp theo

- Kết nối cơ sở dữ liệu thật (MongoDB/PostgreSQL) thay cho `models/store.ts`.
- Đăng nhập/đăng ký (JWT), lưu XP, chuỗi ngày học (streak).
- Upload tệp thật (PDF, DOCX, ảnh) bằng `multer` ở backend và `expo-document-picker` ở app.
- Màn hình ôn tập flashcard (lặp lại ngắt quãng).
- Trang admin thêm/sửa khóa học, bài học, câu hỏi.

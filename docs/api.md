# API

Base URL: `http://localhost:4000/api`

Mọi response thành công có dạng `{ "data": ... }`. Lỗi có dạng `{ "message": "...", "details": ... }`.

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/health` | Kiểm tra server |
| GET | `/courses` | Danh sách khóa học (kèm chương, bài học, bài tập) |
| GET | `/courses/:id` | Chi tiết một khóa học |
| GET | `/study-files` | Danh sách tài liệu ôn tập |
| POST | `/study-files` | Thêm tài liệu ôn tập |
| DELETE | `/study-files/:id` | Xóa tài liệu ôn tập |

## POST `/study-files`

Request body:

```json
{
  "title": "Từ vựng bài 1",
  "content": "apple - quả táo\ndog - con chó"
}
```

Response `201`:

```json
{
  "data": {
    "id": "19d6fc20-9066-448d-ae41-4d931e04bdf0",
    "title": "Từ vựng bài 1",
    "content": "apple - quả táo\ndog - con chó",
    "flashcards": [
      { "front": "apple", "back": "quả táo" },
      { "front": "dog", "back": "con chó" }
    ],
    "createdAt": "2026-10-27T03:00:05.691Z"
  }
}
```

Lỗi `400` khi `title` hoặc `content` rỗng.

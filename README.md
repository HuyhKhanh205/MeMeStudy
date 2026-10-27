# MeMeStudy

Ứng dụng học tập theo phong cách Duolingo: học theo lộ trình bài học ngắn, làm bài tập trắc nghiệm, nhận XP và **thêm tệp/tài liệu của riêng mình để ôn tập** (tự động tạo flashcard).

## Cấu trúc repository

```
MeMeStudy/
├── frontend/
│   ├── user/                # React Native (Expo) + TypeScript — app người dùng
│   │   └── src/
│   │       ├── components/
│   │       ├── screens/
│   │       ├── navigation/
│   │       ├── services/    # Gọi Backend API
│   │       ├── hooks/
│   │       ├── types/
│   │       └── utils/
│   └── admin/               # React (Vite) + TypeScript — trang quản trị
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── layouts/
│           ├── services/    # Gọi Backend API
│           └── types/
├── backend/                 # Node.js + Express + TypeScript
│   └── src/
│       ├── config/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── validators/
│       ├── app.ts
│       └── server.ts
├── docs/                    # Tài liệu, sơ đồ, API
└── README.md
```

## Yêu cầu

- Node.js 22+
- Ứng dụng Expo Go trên điện thoại (hoặc Android Emulator / iOS Simulator)

## Chạy dự án

Mỗi phần là một project npm độc lập. Mở 3 terminal:

```bash
# 1. Backend — http://localhost:4000/api
cd backend
cp .env.example .env
npm install
npm run dev

# 2. Admin — http://localhost:5173
cd frontend/admin
cp .env.example .env
npm install
npm run dev

# 3. App người dùng (Expo)
cd frontend/user
cp .env.example .env
npm install
npm start
```

> Khi chạy app trên điện thoại thật, đổi `EXPO_PUBLIC_API_URL` trong `frontend/user/.env` thành IP LAN của máy tính, ví dụ `http://192.168.1.10:4000/api`.

## Công nghệ

| Phần | Công nghệ |
| --- | --- |
| App người dùng | Expo SDK 57, React Native 0.86, React Navigation 7, TypeScript |
| Admin | React 19, Vite, React Router, TypeScript |
| Backend | Node.js, Express 5, Zod, TypeScript |

Xem thêm trong thư mục [`docs/`](docs/): [kiến trúc](docs/architecture.md) và [API](docs/api.md).

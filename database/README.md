# Cơ sở dữ liệu MariaDB — MeMeStudy (`database/`)

Thư mục này chứa file script SQL để tạo database, bảng và dữ liệu thật cho **MariaDB**.

## 1. Danh sách file
- [`memestudy_mariadb.sql`](./memestudy_mariadb.sql): Script SQL tạo database `memestudy` (bảng mã `utf8mb4_unicode_ci`), đầy đủ 9 bảng (`users`, `seasons`, `rounds`, `exams`, `questions`, `question_choices`, `teacher_assignments`, `attempts`, `attempt_answers`) và dữ liệu khởi tạo.

## 2. Cách đưa vào MariaDB

### Cách A: Dùng giao diện HeidiSQL / DBeaver / phpMyAdmin (Khuyên dùng)
1. Mở **HeidiSQL** (cài sẵn cùng MariaDB) hoặc **DBeaver** / **phpMyAdmin** và đăng nhập vào MariaDB (`localhost:3306`, user `root`).
2. Chọn **File ➔ Load SQL file...** (hoặc `Ctrl + O`) và chọn file `database/memestudy_mariadb.sql`.
3. Nhấn nút **Run (`F9`)**. Database `memestudy` cùng toàn bộ bảng và dữ liệu sẽ được tạo ngay lập tức.

### Cách B: Dùng dòng lệnh (Terminal / Command Prompt)
```powershell
mysql -u root -p < database/memestudy_mariadb.sql
```
*(Hoặc với lệnh `mariadb`: `mariadb -u root -p < database/memestudy_mariadb.sql`).*

## 3. Cấu hình kết nối từ Backend Java (`backend/`)

Backend Java tự động kết nối tới MariaDB theo thông số mặc định trong `backend/src/main/resources/db.properties` (hoặc biến môi trường):
- **URL**: `jdbc:mariadb://localhost:3306/memestudy?useUnicode=true&characterEncoding=UTF-8&createDatabaseIfNotExist=true`
- **User mặc định**: `root`
- **Password mặc định**: *(để trống `""`, hoặc chỉnh trong `backend/src/main/resources/db.properties` / biến môi trường `DB_PASSWORD` nếu MariaDB của bạn có đặt mật khẩu cho `root`)*.

> **Tự động khởi tạo**: Ngay cả khi bạn chỉ tạo database rỗng hoặc chưa kịp chạy script tay, khi Backend khởi động và kết nối được vào MariaDB (`localhost:3306`), `DatabaseManager` sẽ tự động kiểm tra và khởi tạo bảng + nạp dữ liệu từ `memestudy_mariadb.sql` nếu bảng `users` chưa tồn tại.

## 4. Tài khoản có sẵn trong Database
| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên |
| :--- | :--- | :--- | :--- |
| **Học sinh (`USER`)** | `user` | `123456` | Nguyễn Văn An |
| **Giáo viên (`TEACHER`)** | `teacher` | `123456` | Nguyễn Thị Hương Lan |
| **Quản trị (`ADMIN`)** | `admin` | `123456` | Trần Minh Quân |

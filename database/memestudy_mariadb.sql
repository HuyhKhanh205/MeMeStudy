-- =====================================================================
-- CƠ SỞ DỮ LIỆU MARIADB CHO DỰ ÁN MEMESTUDY
-- Cách chạy:
--   mysql -u root -p < database/memestudy_mariadb.sql
-- Hoặc mở file này trong HeidiSQL / DBeaver / phpMyAdmin và nhấn Run (F9)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS memestudy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE memestudy;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attempt_answers;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS teacher_assignments;
DROP TABLE IF EXISTS question_choices;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Bảng người dùng (Học sinh, Giáo viên, Quản trị viên)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  coins INT NOT NULL DEFAULT 120,
  streak_days INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng đợt thi (Seasons)
CREATE TABLE seasons (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  start_date VARCHAR(20) NOT NULL,
  end_date VARCHAR(20) NOT NULL,
  total_rounds_participated INT NOT NULL DEFAULT 0,
  highest_score INT NOT NULL DEFAULT 0,
  description VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng vòng thi (Rounds)
CREATE TABLE rounds (
  id INT PRIMARY KEY,
  season_id VARCHAR(20) NOT NULL,
  round_order INT NOT NULL,
  round_number VARCHAR(10) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(500),
  duration_minutes INT NOT NULL DEFAULT 15,
  question_count INT NOT NULL DEFAULT 30,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  CONSTRAINT fk_rounds_season FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng bài thi thuộc vòng (Exams — mỗi vòng 3 bài, mỗi bài 10 câu)
CREATE TABLE exams (
  id INT PRIMARY KEY,
  round_id INT NOT NULL,
  exam_order INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  question_count INT NOT NULL DEFAULT 10,
  duration_minutes INT NOT NULL DEFAULT 15,
  CONSTRAINT fk_exams_round FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng câu hỏi (Questions — TEXT, LISTENING, IMAGE)
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL DEFAULT 201,
  question_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
  content VARCHAR(1000) NOT NULL,
  correct_index INT NOT NULL DEFAULT 0,
  correct_choice_id INT NOT NULL,
  audio_url VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(100) DEFAULT NULL,
  explanation VARCHAR(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng đáp án của câu hỏi (Question Choices)
CREATE TABLE question_choices (
  id INT PRIMARY KEY,
  question_id INT NOT NULL,
  choice_index INT NOT NULL,
  content VARCHAR(500) NOT NULL,
  CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng đề kiểm tra giáo viên giao (Teacher Assignments)
CREATE TABLE teacher_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  question_count INT NOT NULL DEFAULT 10,
  duration_minutes INT NOT NULL DEFAULT 15,
  deadline VARCHAR(20) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  score INT DEFAULT NULL,
  exam_id INT NOT NULL,
  round_id INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng lượt làm bài thi của học sinh (Attempts)
CREATE TABLE attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  season_id VARCHAR(20) NOT NULL DEFAULT '2026-2027',
  round_id INT NOT NULL,
  exam_id INT NOT NULL DEFAULT 201,
  round_title VARCHAR(180) NOT NULL,
  exam_title VARCHAR(180) NOT NULL DEFAULT 'Bài 1',
  exam_order INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  mode VARCHAR(20) NOT NULL DEFAULT 'exam',
  score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 10,
  duration_seconds INT DEFAULT 420,
  started_at VARCHAR(40) DEFAULT NULL,
  expires_at VARCHAR(40) DEFAULT NULL,
  submitted_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng chi tiết từng câu trả lời trong lượt làm bài (Attempt Answers)
CREATE TABLE attempt_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT DEFAULT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_attempt_answers_attempt FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- DỮ LIỆU KHỞI TẠO (SEED DATA)
-- Mật khẩu mặc định của cả 3 tài khoản: 123456
-- =====================================================================

INSERT INTO users (id, username, password_hash, full_name, role, coins, streak_days) VALUES
(1, 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn A', 'USER', 120, 5),
(2, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Quản trị viên', 'ADMIN', 0, 0),
(3, 'teacher', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Cô Lan', 'TEACHER', 0, 0);

INSERT INTO seasons (id, name, status, start_date, end_date, total_rounds_participated, highest_score, description) VALUES
('2026-2027', 'Đợt thi 2026–2027', 'ACTIVE', '01/09/2026', '31/05/2027', 1, 270, 'Hành trình khám phá tiếng Anh lớp học hoạt hình cùng Cú MeMe!'),
('2025-2026', 'Đợt thi 2025–2026', 'ARCHIVED', '01/09/2025', '31/05/2026', 15, 295, 'Đợt thi đã kết thúc. Toàn bộ kết quả đã được lưu trữ.');

INSERT INTO rounds (id, season_id, round_order, round_number, title, description, duration_minutes, question_count, is_open, status) VALUES
(1, '2026-2027', 1, '01', 'Vòng 01 — Khởi động', 'Khởi động năm học mới với từ vựng đồ dùng học tập và chào hỏi.', 15, 30, TRUE, 'COMPLETED'),
(2, '2026-2027', 2, '02', 'Vòng 02 — Khám phá', 'Khám phá thế giới sở thích, gia đình và trường lớp qua bài học vui nhộn.', 15, 30, TRUE, 'IN_PROGRESS'),
(3, '2026-2027', 3, '03', 'Vòng 03 — Chinh phục', 'Thử thách nâng cao các thì cơ bản và kỹ năng nghe hội thoại thực tế.', 15, 30, FALSE, 'LOCKED');

INSERT INTO exams (id, round_id, exam_order, title, question_count, duration_minutes) VALUES
(101, 1, 1, 'Bài 1: School Things', 10, 15),
(102, 1, 2, 'Bài 2: Daily Greetings', 10, 15),
(103, 1, 3, 'Bài 3: Classroom Rules', 10, 15),
(201, 2, 1, 'Bài 1: Hobbies & Sports', 10, 15),
(202, 2, 2, 'Bài 2: Family & Friends', 10, 15),
(203, 2, 3, 'Bài 3: Animal World & Nature', 10, 15),
(301, 3, 1, 'Bài 1: Around the Town', 10, 15),
(302, 3, 2, 'Bài 2: Future Dreams', 10, 15),
(303, 3, 3, 'Bài 3: Final Master Challenge', 10, 15);

-- Câu hỏi Bài 1 (exam_id = 201): Hobbies & Sports
INSERT INTO questions (id, exam_id, question_type, content, correct_index, correct_choice_id, audio_url, image_url, explanation) VALUES
(2001, 201, 'TEXT', 'Chọn từ thích hợp điền vào chỗ trống: "I like _____ football with my friends every Sunday."', 1, 20012, NULL, NULL, 'Sau động từ "like" thường dùng danh động từ V-ing khi nói về sở thích (like playing football).'),
(2002, 201, 'IMAGE', 'Nhìn hình chú cú MeMe ôm quyển sách và chọn từ đúng:', 0, 20021, NULL, 'books', '"Reading books" nghĩa là đọc sách. Hình ảnh minh họa việc đọc sách.'),
(2003, 201, 'LISTENING', 'Nghe đoạn băng và trả lời: "What is Tom''s favorite hobby?"', 1, 20032, 'listening_hobby_tom.mp3', NULL, 'Trong đoạn băng, Tom nói: "I love listening to music after doing homework."'),
(2004, 201, 'TEXT', '"She doesn''t like swimming because she thinks it is _____."', 1, 20042, NULL, NULL, '"doesn''t like" (không thích) phù hợp với tính từ mang nghĩa tiêu cực là "difficult" (khó khăn).'),
(2005, 201, 'IMAGE', 'Nhìn hình chú cá bơi dưới biển và chọn môn thể thao phù hợp:', 1, 20052, NULL, 'fish', 'Hình chú cá bơi liên tưởng tới môn "Swimming" (bơi lội).'),
(2006, 201, 'LISTENING', 'Nghe đoạn đối thoại: "How often does Anna play badminton?"', 1, 20062, 'listening_badminton_anna.mp3', NULL, 'Anna nói: "I play badminton twice a week with my sister on Tuesdays and Thursdays."'),
(2007, 201, 'TEXT', 'Tìm từ có nghĩa trái ngược với "BORING" (chán nản):', 1, 20072, NULL, NULL, '"Exciting" (thú vị, hào hứng) là từ trái nghĩa trực tiếp với "Boring".'),
(2008, 201, 'IMAGE', 'Nhìn hình chiếc cúp vàng vinh quang và chọn từ vựng đúng:', 0, 20081, NULL, 'trophy', '"Trophy" nghĩa là chiếc cúp chiến thắng dành cho nhà vô địch.'),
(2009, 201, 'LISTENING', 'Nghe đoạn hội thoại: "Where are the students going this Saturday?"', 1, 20092, 'listening_saturday_meet.mp3', NULL, 'Học sinh hẹn nhau: "Let''s meet at the swimming pool this Saturday at 8 AM."'),
(2010, 201, 'TEXT', 'Sắp xếp câu đúng: "you / Do / video games / playing / like / ?"', 0, 20101, NULL, NULL, 'Cấu trúc câu hỏi thì hiện tại đơn với like: Do + S + like + V-ing...?');

-- Câu hỏi Bài 2 (exam_id = 202): Family & Friends
INSERT INTO questions (id, exam_id, question_type, content, correct_index, correct_choice_id, audio_url, image_url, explanation) VALUES
(2011, 202, 'TEXT', 'Điền từ thích hợp: "This is my _____. She is my mother''s sister."', 1, 20112, NULL, NULL, '"Aunt" là cô, dì hoặc bác gái (chị/em gái của mẹ hoặc bố).'),
(2012, 202, 'IMAGE', 'Nhìn hình ngôi nhà ấm áp và chọn từ đúng:', 1, 20122, NULL, 'house', '"Home / House" nghĩa là ngôi nhà thân thương của gia đình.'),
(2013, 202, 'LISTENING', 'Nghe và chọn nghề nghiệp của bố Nam: "What does Nam''s father do?"', 1, 20132, 'listening_father_job.mp3', NULL, 'Nam giới thiệu: "My dad works at the city hospital. He is a doctor."'),
(2014, 202, 'TEXT', '"My best friend Lan is very _____. She always helps everyone with their homework."', 1, 20142, NULL, NULL, '"Kind and helpful" (tốt bụng và hay giúp đỡ) phù hợp với người luôn giúp bạn bè làm bài.'),
(2015, 202, 'IMAGE', 'Nhìn biểu tượng pháo hoa chúc mừng và chọn dịp phù hợp:', 0, 20151, NULL, 'partyPopper', '"Party" (tiệc sinh nhật / liên hoan) gắn liền với biểu tượng pháo hoa rực rỡ.'),
(2016, 202, 'LISTENING', 'Nghe và xác định: "How many people are there in Mai''s family?"', 1, 20162, 'listening_family_members.mp3', NULL, 'Mai nói: "There are four people in my family: my parents, my brother, and me."'),
(2017, 202, 'TEXT', 'Điền đại từ sở hữu đúng: "Peter has a cat. _____ cat is white and lovely."', 0, 20171, NULL, NULL, 'Peter là con trai nên tính từ sở hữu tương ứng là "His".'),
(2018, 202, 'TEXT', '"Who is your cousin?" - "He is my _____ son."', 1, 20182, NULL, NULL, 'Con trai của chú/bác (uncle''s son) gọi là anh/em họ (cousin).'),
(2019, 202, 'LISTENING', 'Nghe đoạn hội thoại: "What do Peter and his family do on Sundays?"', 1, 20192, 'listening_sunday_family.mp3', NULL, 'Peter chia sẻ: "Every Sunday morning, we visit our grandparents in the countryside."'),
(2020, 202, 'TEXT', 'Chọn câu đúng ngữ pháp:', 1, 20202, NULL, NULL, 'Chủ ngữ "They" đi với động từ to-be là "are".');

-- Câu hỏi Bài 3 (exam_id = 203): Animal World & Nature
INSERT INTO questions (id, exam_id, question_type, content, correct_index, correct_choice_id, audio_url, image_url, explanation) VALUES
(2021, 203, 'IMAGE', 'Nhìn hình chú cú thông thái và chọn loài động vật đúng:', 1, 20212, NULL, 'owl', '"Owl" nghĩa là loài cú mèo, mascot thân quen của MeMeStudy.'),
(2022, 203, 'TEXT', '"Which animal is known as the King of the Jungle?"', 1, 20222, NULL, NULL, '"The Lion" (Sư tử) được biết đến là chúa tể rừng xanh (King of the Jungle).'),
(2023, 203, 'LISTENING', 'Nghe đoạn mô tả và đoán con vật: "Which animal are they talking about?"', 2, 20233, 'listening_tall_giraffe.mp3', NULL, 'Đoạn văn nói: "It has a very long neck and eats leaves from tall trees." → Giraffe (hươu cao cổ).'),
(2024, 203, 'IMAGE', 'Nhìn hình chú bạch tuộc và chọn từ đúng:', 0, 20241, NULL, 'octopus', '"Octopus" là con bạch tuộc thông minh dưới lòng đại dương.'),
(2025, 203, 'TEXT', '"A baby dog is called a _____."', 1, 20252, NULL, NULL, 'Chó con trong tiếng Anh gọi là "puppy", mèo con là "kitten".'),
(2026, 203, 'LISTENING', 'Nghe âm thanh và xác định: "What can penguins do?"', 1, 20262, 'listening_penguin_swim.mp3', NULL, 'Đoạn băng: "Penguins cannot fly, but they are great swimmers in cold water."'),
(2027, 203, 'TEXT', 'Điền từ thích hợp: "Look at the sky! The birds are _____ to the south for winter."', 0, 20271, NULL, NULL, 'Chim bay dùng động từ "flying".'),
(2028, 203, 'IMAGE', 'Nhìn hình rạn san hô dưới biển và chọn từ đúng:', 1, 20282, NULL, 'coral', '"Coral reef" là rạn san hô rực rỡ sắc màu dưới biển.'),
(2029, 203, 'TEXT', '"Whales live in the _____."', 1, 20292, NULL, NULL, 'Cá voi (whales) sống ở đại dương (ocean).'),
(2030, 203, 'LISTENING', 'Nghe câu hỏi: "Why should we protect wild animals?"', 0, 20301, 'listening_protect_nature.mp3', NULL, 'Đoạn văn kết luận: "Protecting wildlife keeps our mother nature healthy and balanced."');

-- Đáp án của 30 câu hỏi
INSERT INTO question_choices (id, question_id, choice_index, content) VALUES
(20011, 2001, 0, 'play'), (20012, 2001, 1, 'playing'), (20013, 2001, 2, 'played'), (20014, 2001, 3, 'plays'),
(20021, 2002, 0, 'Reading books'), (20022, 2002, 1, 'Playing piano'), (20023, 2002, 2, 'Swimming'), (20024, 2002, 3, 'Riding a bike'),
(20031, 2003, 0, 'Drawing pictures'), (20032, 2003, 1, 'Listening to music'), (20033, 2003, 2, 'Playing chess'), (20034, 2003, 3, 'Cooking'),
(20041, 2004, 0, 'fun'), (20042, 2004, 1, 'difficult'), (20043, 2004, 2, 'interesting'), (20044, 2004, 3, 'easy'),
(20051, 2005, 0, 'Skiing'), (20052, 2005, 1, 'Swimming'), (20053, 2005, 2, 'Skating'), (20054, 2005, 3, 'Running'),
(20061, 2006, 0, 'Once a week'), (20062, 2006, 1, 'Twice a week'), (20063, 2006, 2, 'Every day'), (20064, 2006, 3, 'Never'),
(20071, 2007, 0, 'Tired'), (20072, 2007, 1, 'Exciting'), (20073, 2007, 2, 'Sad'), (20074, 2007, 3, 'Difficult'),
(20081, 2008, 0, 'Trophy / Champion'), (20082, 2008, 1, 'Medal / Silver'), (20083, 2008, 2, 'Ball / Football'), (20084, 2008, 3, 'Gloves / Boxing'),
(20091, 2009, 0, 'To the cinema'), (20092, 2009, 1, 'To the swimming pool'), (20093, 2009, 2, 'To the zoo'), (20094, 2009, 3, 'To the library'),
(20101, 2010, 0, 'Do you like playing video games?'), (20102, 2010, 1, 'Do you playing like video games?'), (20103, 2010, 2, 'You do like playing video games?'), (20104, 2010, 3, 'Do like you playing video games?'),
(20111, 2011, 0, 'uncle'), (20112, 2011, 1, 'aunt'), (20113, 2011, 2, 'cousin'), (20114, 2011, 3, 'grandmother'),
(20121, 2012, 0, 'School'), (20122, 2012, 1, 'House / Home'), (20123, 2012, 2, 'Hospital'), (20124, 2012, 3, 'Park'),
(20131, 2013, 0, 'He is an engineer'), (20132, 2013, 1, 'He is a doctor'), (20133, 2013, 2, 'He is a teacher'), (20134, 2013, 3, 'He is a chef'),
(20141, 2014, 0, 'lazy'), (20142, 2014, 1, 'kind and helpful'), (20143, 2014, 2, 'selfish'), (20144, 2014, 3, 'angry'),
(20151, 2015, 0, 'Birthday Party'), (20152, 2015, 1, 'Bedtime'), (20153, 2015, 2, 'Test time'), (20154, 2015, 3, 'Cleaning time'),
(20161, 2016, 0, '3 people'), (20162, 2016, 1, '4 people'), (20163, 2016, 2, '5 people'), (20164, 2016, 3, '6 people'),
(20171, 2017, 0, 'His'), (20172, 2017, 1, 'Her'), (20173, 2017, 2, 'Their'), (20174, 2017, 3, 'My'),
(20181, 2018, 0, 'brother''s'), (20182, 2018, 1, 'uncle''s'), (20183, 2018, 2, 'sister''s'), (20184, 2018, 3, 'father''s'),
(20191, 2019, 0, 'They stay at home'), (20192, 2019, 1, 'They visit their grandparents'), (20193, 2019, 2, 'They go shopping'), (20194, 2019, 3, 'They go to the zoo'),
(20201, 2020, 0, 'They is my best friends.'), (20202, 2020, 1, 'They are my best friends.'), (20203, 2020, 2, 'They am my best friends.'), (20204, 2020, 3, 'They be my best friends.'),
(20211, 2021, 0, 'Eagle'), (20212, 2021, 1, 'Owl'), (20213, 2021, 2, 'Parrot'), (20214, 2021, 3, 'Penguin'),
(20221, 2022, 0, 'The Elephant'), (20222, 2022, 1, 'The Lion'), (20223, 2022, 2, 'The Monkey'), (20224, 2022, 3, 'The Tiger'),
(20231, 2023, 0, 'Dolphin'), (20232, 2023, 1, 'Elephant'), (20233, 2023, 2, 'Giraffe'), (20234, 2023, 3, 'Kangaroo'),
(20241, 2024, 0, 'Octopus'), (20242, 2024, 1, 'Shark'), (20243, 2024, 2, 'Crab'), (20244, 2024, 3, 'Whale'),
(20251, 2025, 0, 'kitten'), (20252, 2025, 1, 'puppy'), (20253, 2025, 2, 'cub'), (20254, 2025, 3, 'calf'),
(20261, 2026, 0, 'They can fly very high'), (20262, 2026, 1, 'They can swim very well'), (20263, 2026, 2, 'They can climb trees'), (20264, 2026, 3, 'They can sing'),
(20271, 2027, 0, 'flying'), (20272, 2027, 1, 'swimming'), (20273, 2027, 2, 'running'), (20274, 2027, 3, 'crawling'),
(20281, 2028, 0, 'Forest'), (20282, 2028, 1, 'Coral reef'), (20283, 2028, 2, 'Mountain'), (20284, 2028, 3, 'Desert'),
(20291, 2029, 0, 'forest'), (20292, 2029, 1, 'ocean'), (20293, 2029, 2, 'desert'), (20294, 2029, 3, 'cave'),
(20301, 2030, 0, 'Because they keep nature in balance'), (20302, 2030, 1, 'Because they are noisy'), (20303, 2030, 2, 'Because they live in houses'), (20304, 2030, 3, 'Because they eat grass');

-- Đề kiểm tra giáo viên giao
INSERT INTO teacher_assignments (id, title, question_count, duration_minutes, deadline, is_completed, score, exam_id, round_id) VALUES
(1, 'Kiểm tra Unit 5 — My hobbies', 10, 15, '10/11', FALSE, NULL, 201, 2),
(2, 'Listening Practice — Grade 5', 10, 15, '05/11', TRUE, 90, 101, 1);

-- Lịch sử làm bài của học sinh user (id = 1)
INSERT INTO attempts (id, user_id, season_id, round_id, exam_id, round_title, exam_title, exam_order, status, mode, score, correct_count, total_questions, duration_seconds, submitted_at) VALUES
(901, 1, '2026-2027', 1, 101, 'Vòng 01 — Khởi động', 'Bài 1: School Things', 1, 'SUBMITTED', 'exam', 90, 9, 10, 420, '2026-10-15T08:30:00Z'),
(902, 1, '2026-2027', 1, 102, 'Vòng 01 — Khởi động', 'Bài 2: Daily Greetings', 2, 'SUBMITTED', 'exam', 100, 10, 10, 380, '2026-10-16T14:15:00Z'),
(903, 1, '2026-2027', 1, 103, 'Vòng 01 — Khởi động', 'Bài 3: Classroom Rules', 3, 'SUBMITTED', 'exam', 80, 8, 10, 510, '2026-10-18T10:00:00Z'),
(843, 1, '2025-2026', 65, 543, 'Vòng 15 — Niên khóa 2025–2026', 'Bài 1: Tổng ôn tập 15', 1, 'SUBMITTED', 'exam', 98, 9, 10, 400, '2026-03-16T09:00:00Z'),
(844, 1, '2025-2026', 65, 544, 'Vòng 15 — Niên khóa 2025–2026', 'Bài 2: Kỹ năng nâng cao 15', 2, 'SUBMITTED', 'exam', 100, 10, 10, 430, '2026-03-17T10:00:00Z'),
(845, 1, '2025-2026', 65, 545, 'Vòng 15 — Niên khóa 2025–2026', 'Bài 3: Đấu trường về đích 15', 3, 'SUBMITTED', 'exam', 97, 9, 10, 460, '2026-03-18T11:00:00Z');

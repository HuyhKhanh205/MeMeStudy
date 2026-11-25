package com.memestudy.backend.store;

import com.memestudy.backend.db.DatabaseManager;
import com.memestudy.backend.model.AttemptDto;
import com.memestudy.backend.model.AttemptResultDto;
import com.memestudy.backend.model.ChoiceDto;
import com.memestudy.backend.model.QuestionDto;
import com.memestudy.backend.model.RoundDto;
import com.memestudy.backend.model.UserDto;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Tầng truy xuất dữ liệu (Data Access Layer) kết nối trực tiếp với MariaDB (database: memestudy).
 * Đồng thời có bộ nhớ đệm an toàn nếu dịch vụ MariaDB chưa kịp bật.
 */
public class InMemoryStore {

    public static class AccountRecord {
        private final UserDto user;
        private final String passwordHash;

        public AccountRecord(UserDto user, String passwordHash) {
            this.user = user;
            this.passwordHash = passwordHash;
        }

        public UserDto getUser() {
            return user;
        }

        public String getPasswordHash() {
            return passwordHash;
        }
    }

    private static final List<AccountRecord> ACCOUNTS = new CopyOnWriteArrayList<>();
    private static final List<RoundDto> ROUNDS = new CopyOnWriteArrayList<>();
    private static final List<QuestionDto> QUESTIONS = new CopyOnWriteArrayList<>();
    private static final Map<Integer, AttemptDto> ACTIVE_ATTEMPTS = new ConcurrentHashMap<>();
    private static final Map<Integer, List<AttemptResultDto>> USER_RESULTS = new ConcurrentHashMap<>();

    private static final AtomicInteger NEXT_USER_ID = new AtomicInteger(100);
    private static final AtomicInteger NEXT_ATTEMPT_ID = new AtomicInteger(2000);

    static {
        DatabaseManager.initDatabase();
        initAccounts();
        initRounds();
        initQuestions();
        initSeedResults();
    }

    private static void initAccounts() {
        ACCOUNTS.add(new AccountRecord(
                new UserDto(1, "user", "Nguyễn Văn An", "Nam", "15/05/2015", "Lớp 5A", "USER"),
                BCrypt.hashpw("123456", BCrypt.gensalt())
        ));
        ACCOUNTS.add(new AccountRecord(
                new UserDto(2, "admin", "Trần Minh Quân", "Nam", "20/10/1995", "Quản trị hệ thống", "ADMIN"),
                BCrypt.hashpw("123456", BCrypt.gensalt())
        ));
        ACCOUNTS.add(new AccountRecord(
                new UserDto(3, "teacher", "Nguyễn Thị Hương Lan", "Nữ", "12/08/1992", "Giáo viên Tiếng Anh", "TEACHER"),
                BCrypt.hashpw("123456", BCrypt.gensalt())
        ));
    }

    private static void initRounds() {
        ROUNDS.add(new RoundDto(
                1, "2026-2027", null, 1, "01", "COMPLETED",
                "Vòng 01 — Khởi động",
                "Khởi động năm học mới với từ vựng đồ dùng học tập và chào hỏi.",
                15, 30, true
        ));
        ROUNDS.add(new RoundDto(
                2, "2026-2027", 1, 2, "02", "IN_PROGRESS",
                "Vòng 02 — Khám phá",
                "Khám phá thế giới sở thích, gia đình và trường lớp qua bài học vui nhộn.",
                15, 30, true
        ));
        ROUNDS.add(new RoundDto(
                3, "2026-2027", 2, 3, "03", "LOCKED",
                "Vòng 03 — Chinh phục",
                "Thử thách nâng cao các thì cơ bản và kỹ năng nghe hội thoại thực tế.",
                15, 30, false
        ));
    }

    private static QuestionDto makeQ(
            int id, int examId, String type, String content,
            List<String> opts, int correctIdx, String explanation,
            String audioUrl, String imageUrl
    ) {
        List<ChoiceDto> choices = new ArrayList<>();
        for (int i = 0; i < opts.size(); i++) {
            choices.add(new ChoiceDto(id * 10 + (i + 1), opts.get(i)));
        }
        int correctChoiceId = choices.get(correctIdx).getId();
        return new QuestionDto(id, examId, type, content, choices, correctChoiceId, correctIdx, audioUrl, imageUrl, explanation);
    }

    private static void initQuestions() {
        // Bài 1 (201)
        QUESTIONS.add(makeQ(2001, 201, "TEXT", "Chọn từ thích hợp điền vào chỗ trống: \"I like _____ football with my friends every Sunday.\"",
                Arrays.asList("play", "playing", "played", "plays"), 1,
                "Sau động từ \"like\" thường dùng danh động từ V-ing khi nói về sở thích (like playing football).", null, null));
        QUESTIONS.add(makeQ(2002, 201, "IMAGE", "Nhìn hình chú cú MeMe ôm quyển sách và chọn từ đúng:",
                Arrays.asList("Reading books", "Playing piano", "Swimming", "Riding a bike"), 0,
                "\"Reading books\" nghĩa là đọc sách. Hình ảnh minh họa việc đọc sách.", null, "books"));
        QUESTIONS.add(makeQ(2003, 201, "LISTENING", "Nghe đoạn băng và trả lời: \"What is Tom's favorite hobby?\"",
                Arrays.asList("Drawing pictures", "Listening to music", "Playing chess", "Cooking"), 1,
                "Trong đoạn băng, Tom nói: \"I love listening to music after doing homework.\"", "listening_hobby_tom.mp3", null));
        QUESTIONS.add(makeQ(2004, 201, "TEXT", "\"She doesn't like swimming because she thinks it is _____.\"",
                Arrays.asList("fun", "difficult", "interesting", "easy"), 1,
                "\"doesn't like\" (không thích) phù hợp với tính từ mang nghĩa tiêu cực là \"difficult\" (khó khăn).", null, null));
        QUESTIONS.add(makeQ(2005, 201, "IMAGE", "Nhìn hình chú cá bơi dưới biển và chọn môn thể thao phù hợp:",
                Arrays.asList("Skiing", "Swimming", "Skating", "Running"), 1,
                "Hình chú cá bơi liên tưởng tới môn \"Swimming\" (bơi lội).", null, "fish"));
        QUESTIONS.add(makeQ(2006, 201, "LISTENING", "Nghe đoạn đối thoại: \"How often does Anna play badminton?\"",
                Arrays.asList("Once a week", "Twice a week", "Every day", "Never"), 1,
                "Anna nói: \"I play badminton twice a week with my sister on Tuesdays and Thursdays.\"", "listening_badminton_anna.mp3", null));
        QUESTIONS.add(makeQ(2007, 201, "TEXT", "Tìm từ có nghĩa trái ngược với \"BORING\" (chán nản):",
                Arrays.asList("Tired", "Exciting", "Sad", "Difficult"), 1,
                "\"Exciting\" (thú vị, hào hứng) là từ trái nghĩa trực tiếp với \"Boring\".", null, null));
        QUESTIONS.add(makeQ(2008, 201, "IMAGE", "Nhìn hình chiếc cúp vàng vinh quang và chọn từ vựng đúng:",
                Arrays.asList("Trophy / Champion", "Medal / Silver", "Ball / Football", "Gloves / Boxing"), 0,
                "\"Trophy\" nghĩa là chiếc cúp chiến thắng dành cho nhà vô địch.", null, "trophy"));
        QUESTIONS.add(makeQ(2009, 201, "LISTENING", "Nghe đoạn hội thoại: \"Where are the students going this Saturday?\"",
                Arrays.asList("To the cinema", "To the swimming pool", "To the zoo", "To the library"), 1,
                "Học sinh hẹn nhau: \"Let's meet at the swimming pool this Saturday at 8 AM.\"", "listening_saturday_meet.mp3", null));
        QUESTIONS.add(makeQ(2010, 201, "TEXT", "Sắp xếp câu đúng: \"you / Do / video games / playing / like / ?\"",
                Arrays.asList("Do you like playing video games?", "Do you playing like video games?", "You do like playing video games?", "Do like you playing video games?"), 0,
                "Cấu trúc câu hỏi thì hiện tại đơn với like: Do + S + like + V-ing...?", null, null));

        // Bài 2 (202)
        QUESTIONS.add(makeQ(2011, 202, "TEXT", "Điền từ thích hợp: \"This is my _____. She is my mother's sister.\"",
                Arrays.asList("uncle", "aunt", "cousin", "grandmother"), 1,
                "\"Aunt\" là cô, dì hoặc bác gái (chị/em gái của mẹ hoặc bố).", null, null));
        QUESTIONS.add(makeQ(2012, 202, "IMAGE", "Nhìn hình ngôi nhà ấm áp và chọn từ đúng:",
                Arrays.asList("School", "House / Home", "Hospital", "Park"), 1,
                "\"Home / House\" nghĩa là ngôi nhà thân thương của gia đình.", null, "house"));
        QUESTIONS.add(makeQ(2013, 202, "LISTENING", "Nghe và chọn nghề nghiệp của bố Nam: \"What does Nam's father do?\"",
                Arrays.asList("He is an engineer", "He is a doctor", "He is a teacher", "He is a chef"), 1,
                "Nam giới thiệu: \"My dad works at the city hospital. He is a doctor.\"", "listening_father_job.mp3", null));
        QUESTIONS.add(makeQ(2014, 202, "TEXT", "\"My best friend Lan is very _____. She always helps everyone with their homework.\"",
                Arrays.asList("lazy", "kind and helpful", "selfish", "angry"), 1,
                "\"Kind and helpful\" (tốt bụng và hay giúp đỡ) phù hợp với người luôn giúp bạn bè làm bài.", null, null));
        QUESTIONS.add(makeQ(2015, 202, "IMAGE", "Nhìn biểu tượng pháo hoa chúc mừng và chọn dịp phù hợp:",
                Arrays.asList("Birthday Party", "Bedtime", "Test time", "Cleaning time"), 0,
                "\"Party\" (tiệc sinh nhật / liên hoan) gắn liền với biểu tượng pháo hoa rực rỡ.", null, "partyPopper"));
        QUESTIONS.add(makeQ(2016, 202, "LISTENING", "Nghe và xác định: \"How many people are there in Mai's family?\"",
                Arrays.asList("3 people", "4 people", "5 people", "6 people"), 1,
                "Mai nói: \"There are four people in my family: my parents, my brother, and me.\"", "listening_family_members.mp3", null));
        QUESTIONS.add(makeQ(2017, 202, "TEXT", "Điền đại từ sở hữu đúng: \"Peter has a cat. _____ cat is white and lovely.\"",
                Arrays.asList("His", "Her", "Their", "My"), 0,
                "Peter là con trai nên tính từ sở hữu tương ứng là \"His\".", null, null));
        QUESTIONS.add(makeQ(2018, 202, "TEXT", "\"Who is your cousin?\" - \"He is my _____ son.\"",
                Arrays.asList("brother's", "uncle's", "sister's", "father's"), 1,
                "Con trai của chú/bác (uncle's son) gọi là anh/em họ (cousin).", null, null));
        QUESTIONS.add(makeQ(2019, 202, "LISTENING", "Nghe đoạn hội thoại: \"What do Peter and his family do on Sundays?\"",
                Arrays.asList("They stay at home", "They visit their grandparents", "They go shopping", "They go to the zoo"), 1,
                "Peter chia sẻ: \"Every Sunday morning, we visit our grandparents in the countryside.\"", "listening_sunday_family.mp3", null));
        QUESTIONS.add(makeQ(2020, 202, "TEXT", "Chọn câu đúng ngữ pháp:",
                Arrays.asList("They is my best friends.", "They are my best friends.", "They am my best friends.", "They be my best friends."), 1,
                "Chủ ngữ \"They\" đi với động từ to-be là \"are\".", null, null));

        // Bài 3 (203)
        QUESTIONS.add(makeQ(2021, 203, "IMAGE", "Nhìn hình chú cú thông thái và chọn loài động vật đúng:",
                Arrays.asList("Eagle", "Owl", "Parrot", "Penguin"), 1,
                "\"Owl\" nghĩa là loài cú mèo, mascot thân quen của MeMeStudy.", null, "owl"));
        QUESTIONS.add(makeQ(2022, 203, "TEXT", "\"Which animal is known as the King of the Jungle?\"",
                Arrays.asList("The Elephant", "The Lion", "The Monkey", "The Tiger"), 1,
                "\"The Lion\" (Sư tử) được biết đến là chúa tể rừng xanh (King of the Jungle).", null, null));
        QUESTIONS.add(makeQ(2023, 203, "LISTENING", "Nghe đoạn mô tả và đoán con vật: \"Which animal are they talking about?\"",
                Arrays.asList("Dolphin", "Elephant", "Giraffe", "Kangaroo"), 2,
                "Đoạn văn nói: \"It has a very long neck and eats leaves from tall trees.\" → Giraffe (hươu cao cổ).", "listening_tall_giraffe.mp3", null));
        QUESTIONS.add(makeQ(2024, 203, "IMAGE", "Nhìn hình chú bạch tuộc và chọn từ đúng:",
                Arrays.asList("Octopus", "Shark", "Crab", "Whale"), 0,
                "\"Octopus\" là con bạch tuộc thông minh dưới lòng đại dương.", null, "octopus"));
        QUESTIONS.add(makeQ(2025, 203, "TEXT", "\"A baby dog is called a _____.\"",
                Arrays.asList("kitten", "puppy", "cub", "calf"), 1,
                "Chó con trong tiếng Anh gọi là \"puppy\", mèo con là \"kitten\".", null, null));
        QUESTIONS.add(makeQ(2026, 203, "LISTENING", "Nghe âm thanh và xác định: \"What can penguins do?\"",
                Arrays.asList("They can fly very high", "They can swim very well", "They can climb trees", "They can sing"), 1,
                "Đoạn băng: \"Penguins cannot fly, but they are great swimmers in cold water.\"", "listening_penguin_swim.mp3", null));
        QUESTIONS.add(makeQ(2027, 203, "TEXT", "Điền từ thích hợp: \"Look at the sky! The birds are _____ to the south for winter.\"",
                Arrays.asList("flying", "swimming", "running", "crawling"), 0,
                "Chim bay dùng động từ \"flying\".", null, null));
        QUESTIONS.add(makeQ(2028, 203, "IMAGE", "Nhìn hình rạn san hô dưới biển và chọn từ đúng:",
                Arrays.asList("Forest", "Coral reef", "Mountain", "Desert"), 1,
                "\"Coral reef\" là rạn san hô rực rỡ sắc màu dưới biển.", null, "coral"));
        QUESTIONS.add(makeQ(2029, 203, "TEXT", "\"Whales live in the _____.\"",
                Arrays.asList("forest", "ocean", "desert", "cave"), 1,
                "Cá voi (whales) sống ở đại dương (ocean).", null, null));
        QUESTIONS.add(makeQ(2030, 203, "LISTENING", "Nghe câu hỏi: \"Why should we protect wild animals?\"",
                Arrays.asList("Because they keep nature in balance", "Because they are noisy", "Because they live in houses", "Because they eat grass"), 0,
                "Đoạn văn kết luận: \"Protecting wildlife keeps our mother nature healthy and balanced.\"", "listening_protect_nature.mp3", null));
    }

    private static void initSeedResults() {
        List<AttemptResultDto> user1Results = new CopyOnWriteArrayList<>();
        user1Results.add(new AttemptResultDto(
                901, 1, "2026-2027", 1, 101, "Vòng 01 — Khởi động", "Bài 1: School Things", 1,
                90, 9, 10, "2026-10-15T08:30:00Z", 420, "exam", createSeedReview(201, 9)
        ));
        user1Results.add(new AttemptResultDto(
                902, 1, "2026-2027", 1, 102, "Vòng 01 — Khởi động", "Bài 2: Daily Greetings", 2,
                100, 10, 10, "2026-10-16T14:15:00Z", 380, "exam", createSeedReview(202, 10)
        ));
        user1Results.add(new AttemptResultDto(
                903, 1, "2026-2027", 1, 103, "Vòng 01 — Khởi động", "Bài 3: Classroom Rules", 3,
                80, 8, 10, "2026-10-18T10:00:00Z", 510, "exam", createSeedReview(203, 8)
        ));
        user1Results.add(new AttemptResultDto(
                801, 1, "2025-2026", 4, 401, "Vòng 01 — Niên khóa 2025–2026", "Bài 1: Tổng ôn tập Từ vựng", 1,
                100, 10, 10, "2026-03-16T09:00:00Z", 400, "exam", createSeedReview(201, 10)
        ));
        user1Results.add(new AttemptResultDto(
                802, 1, "2025-2026", 4, 402, "Vòng 01 — Niên khóa 2025–2026", "Bài 2: Kỹ năng Ngữ pháp & Đọc hiểu", 2,
                100, 10, 10, "2026-03-17T10:00:00Z", 430, "exam", createSeedReview(202, 10)
        ));
        user1Results.add(new AttemptResultDto(
                803, 1, "2025-2026", 4, 403, "Vòng 01 — Niên khóa 2025–2026", "Bài 3: Đấu trường Nghe & Phản xạ", 3,
                90, 9, 10, "2026-03-18T11:00:00Z", 460, "exam", createSeedReview(203, 9)
        ));
        USER_RESULTS.put(1, user1Results);
    }

    private static List<AttemptResultDto.QuestionReviewItem> createSeedReview(int examId, int correctCount) {
        List<AttemptResultDto.QuestionReviewItem> items = new ArrayList<>();
        List<QuestionDto> examQs = new ArrayList<>();
        for (QuestionDto q : QUESTIONS) {
            if (q.getExamId() != null && q.getExamId() == examId) {
                examQs.add(q);
            }
        }
        for (int i = 0; i < examQs.size(); i++) {
            QuestionDto q = examQs.get(i);
            boolean isCorrect = i < correctCount;
            Integer chosen = isCorrect
                    ? q.getCorrectChoiceId()
                    : q.getChoices().get(0).getId();
            items.add(new AttemptResultDto.QuestionReviewItem(q.getId(), isCorrect, chosen));
        }
        return items;
    }

    public static AccountRecord findByUsername(String username) {
        if (username == null) return null;
        String clean = username.trim();

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "SELECT id, username, password_hash, full_name, gender, birth_date, class_name, role FROM users WHERE LOWER(username) = LOWER(?)")) {
                ps.setString(1, clean);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        UserDto u = new UserDto(
                                rs.getInt("id"),
                                rs.getString("username"),
                                rs.getString("full_name"),
                                rs.getString("gender"),
                                rs.getString("birth_date"),
                                rs.getString("class_name"),
                                rs.getString("role")
                        );
                        return new AccountRecord(u, rs.getString("password_hash"));
                    }
                    return null;
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] findByUsername error: " + e.getMessage());
            }
        }

        for (AccountRecord acc : ACCOUNTS) {
            if (acc.getUser().getUsername().equalsIgnoreCase(clean)) {
                return acc;
            }
        }
        return null;
    }

    public static UserDto findUserById(Integer userId) {
        if (userId == null) return null;

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "SELECT id, username, full_name, gender, birth_date, class_name, role FROM users WHERE id = ?")) {
                ps.setInt(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return new UserDto(
                                rs.getInt("id"),
                                rs.getString("username"),
                                rs.getString("full_name"),
                                rs.getString("gender"),
                                rs.getString("birth_date"),
                                rs.getString("class_name"),
                                rs.getString("role")
                        );
                    }
                    return null;
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] findUserById error: " + e.getMessage());
            }
        }

        for (AccountRecord acc : ACCOUNTS) {
            if (acc.getUser().getId() == userId) {
                return acc.getUser();
            }
        }
        return null;
    }

    public static UserDto registerUser(String username, String password, String fullName, String role) {
        String normalizedRole = ("TEACHER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role))
                ? role.toUpperCase()
                : "USER";
        String hash = BCrypt.hashpw(password, BCrypt.gensalt());

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "INSERT INTO users (username, password_hash, full_name, role, coins, streak_days) VALUES (?, ?, ?, ?, 120, 1)",
                         Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, username.trim());
                ps.setString(2, hash);
                ps.setString(3, fullName.trim());
                ps.setString(4, normalizedRole);
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        int newId = keys.getInt(1);
                        UserDto u = new UserDto(newId, username.trim(), fullName.trim(), normalizedRole);
                        ACCOUNTS.add(new AccountRecord(u, hash));
                        USER_RESULTS.put(newId, new CopyOnWriteArrayList<>());
                        return u;
                    }
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] registerUser error: " + e.getMessage());
            }
        }

        int id = NEXT_USER_ID.getAndIncrement();
        UserDto user = new UserDto(id, username.trim(), fullName.trim(), normalizedRole);
        ACCOUNTS.add(new AccountRecord(user, hash));
        USER_RESULTS.put(id, new CopyOnWriteArrayList<>());
        return user;
    }

    public static UserDto updateUserProfile(
            int userId,
            String fullName,
            String gender,
            String birthDate,
            String className
    ) {
        String cleanName = fullName != null ? fullName.trim() : "";
        String cleanGender = (gender != null && !gender.isBlank()) ? gender.trim() : "Nam";
        String cleanBirthDate = (birthDate != null && !birthDate.isBlank()) ? birthDate.trim() : "15/05/2015";
        String cleanClassName = (className != null && !className.isBlank()) ? className.trim() : "Lớp 5A";

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "UPDATE users SET full_name = ?, gender = ?, birth_date = ?, class_name = ? WHERE id = ?")) {
                ps.setString(1, cleanName);
                ps.setString(2, cleanGender);
                ps.setString(3, cleanBirthDate);
                ps.setString(4, cleanClassName);
                ps.setInt(5, userId);
                ps.executeUpdate();
            } catch (Exception e) {
                System.err.println("[MariaDB] updateUserProfile error: " + e.getMessage());
            }
        }

        for (AccountRecord rec : ACCOUNTS) {
            if (rec.getUser().getId() == userId) {
                rec.getUser().setFullName(cleanName);
                rec.getUser().setGender(cleanGender);
                rec.getUser().setBirthDate(cleanBirthDate);
                rec.getUser().setClassName(cleanClassName);
                return rec.getUser();
            }
        }
        return findUserById(userId);
    }

    public static boolean changeUserPassword(int userId, String currentPassword, String newPassword) {
        String currentHash = null;
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement("SELECT password_hash FROM users WHERE id = ?")) {
                ps.setInt(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        currentHash = rs.getString("password_hash");
                    }
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] changeUserPassword select error: " + e.getMessage());
            }
        }

        if (currentHash == null) {
            for (AccountRecord rec : ACCOUNTS) {
                if (rec.getUser().getId() == userId) {
                    currentHash = rec.getPasswordHash();
                    break;
                }
            }
        }

        if (currentHash == null || !BCrypt.checkpw(currentPassword, currentHash)) {
            return false;
        }

        String newHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement("UPDATE users SET password_hash = ? WHERE id = ?")) {
                ps.setString(1, newHash);
                ps.setInt(2, userId);
                ps.executeUpdate();
            } catch (Exception e) {
                System.err.println("[MariaDB] changeUserPassword update error: " + e.getMessage());
            }
        }

        for (int i = 0; i < ACCOUNTS.size(); i++) {
            AccountRecord rec = ACCOUNTS.get(i);
            if (rec.getUser().getId() == userId) {
                ACCOUNTS.set(i, new AccountRecord(rec.getUser(), newHash));
                break;
            }
        }
        return true;
    }

    public static List<RoundDto> getRounds() {
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "SELECT id, season_id, prerequisite_round_id, round_order, round_number, status, title, description, duration_minutes, question_count, is_open FROM rounds WHERE season_id = '2026-2027' ORDER BY round_order ASC");
                 ResultSet rs = ps.executeQuery()) {
                List<RoundDto> list = new ArrayList<>();
                while (rs.next()) {
                    int preId = rs.getInt("prerequisite_round_id");
                    Integer preObj = rs.wasNull() ? null : preId;
                    list.add(new RoundDto(
                            rs.getInt("id"),
                            rs.getString("season_id"),
                            preObj,
                            rs.getInt("round_order"),
                            rs.getString("round_number"),
                            rs.getString("status"),
                            rs.getString("title"),
                            rs.getString("description"),
                            rs.getInt("duration_minutes"),
                            rs.getInt("question_count"),
                            rs.getBoolean("is_open")
                    ));
                }
                if (!list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] getRounds error: " + e.getMessage());
            }
        }
        return Collections.unmodifiableList(ROUNDS);
    }

    public static RoundDto findRoundById(int roundId) {
        for (RoundDto r : getRounds()) {
            if (r.getId() == roundId) return r;
        }
        return null;
    }

    public static List<QuestionDto> getQuestions() {
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection()) {
                Map<Integer, List<ChoiceDto>> choicesMap = new LinkedHashMap<>();
                try (PreparedStatement cps = conn.prepareStatement(
                        "SELECT id, question_id, choice_index, content FROM question_choices ORDER BY question_id ASC, choice_index ASC");
                     ResultSet crs = cps.executeQuery()) {
                    while (crs.next()) {
                        int qId = crs.getInt("question_id");
                        choicesMap.computeIfAbsent(qId, k -> new ArrayList<>())
                                .add(new ChoiceDto(crs.getInt("id"), crs.getString("content")));
                    }
                }

                List<QuestionDto> list = new ArrayList<>();
                try (PreparedStatement qps = conn.prepareStatement(
                        "SELECT id, exam_id, question_type, content, correct_index, correct_choice_id, audio_url, image_url, explanation FROM questions ORDER BY id ASC");
                     ResultSet qrs = qps.executeQuery()) {
                    while (qrs.next()) {
                        int qId = qrs.getInt("id");
                        List<ChoiceDto> choices = choicesMap.getOrDefault(qId, new ArrayList<>());
                        list.add(new QuestionDto(
                                qId,
                                qrs.getInt("exam_id"),
                                qrs.getString("question_type"),
                                qrs.getString("content"),
                                choices,
                                qrs.getInt("correct_choice_id"),
                                qrs.getInt("correct_index"),
                                qrs.getString("audio_url"),
                                qrs.getString("image_url"),
                                qrs.getString("explanation")
                        ));
                    }
                }
                if (!list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] getQuestions error: " + e.getMessage());
            }
        }
        return Collections.unmodifiableList(QUESTIONS);
    }

    public static List<QuestionDto> getQuestionsForExam(int examId) {
        List<QuestionDto> all = getQuestions();
        List<QuestionDto> match = new ArrayList<>();
        for (QuestionDto q : all) {
            if (q.getExamId() != null && q.getExamId() == examId) {
                match.add(q);
            }
        }
        if (!match.isEmpty()) return match;

        int order = examId % 10;
        int fallbackExamId = order == 2 ? 202 : order == 3 ? 203 : 201;
        for (QuestionDto q : all) {
            if (q.getExamId() != null && q.getExamId() == fallbackExamId) {
                match.add(q);
            }
        }
        return !match.isEmpty() ? match : all.subList(0, Math.min(10, all.size()));
    }

    public static QuestionDto findQuestionById(int questionId) {
        for (QuestionDto q : getQuestions()) {
            if (q.getId() == questionId) return q;
        }
        return null;
    }

    public static AttemptDto createAttempt(int userId, RoundDto round, Integer targetExamId) {
        int examId = targetExamId != null ? targetExamId : (round.getId() == 1 ? 101 : 201);
        int examOrder = examId % 10;
        if (examOrder < 1 || examOrder > 3) examOrder = 1;
        String examTitle = "Bài " + examOrder;

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement ps = conn.prepareStatement("SELECT title, exam_order FROM exams WHERE id = ?")) {
                ps.setInt(1, examId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        examTitle = rs.getString("title");
                        examOrder = rs.getInt("exam_order");
                    }
                }
            } catch (Exception ignored) {
            }
        }

        int attemptId = NEXT_ATTEMPT_ID.getAndIncrement();
        Instant now = Instant.now();
        Instant expires = now.plusSeconds(round.getDurationMinutes() * 60L);
        List<QuestionDto> examQuestions = getQuestionsForExam(examId);
        List<QuestionDto> safeQuestions = new ArrayList<>();
        for (QuestionDto q : examQuestions) {
            safeQuestions.add(q.withoutAnswer());
        }
        AttemptDto attempt = new AttemptDto(
                attemptId,
                userId,
                round.getSeasonId() != null ? round.getSeasonId() : "2026-2027",
                round.getId(),
                examId,
                examOrder,
                round.getTitle(),
                examTitle,
                "IN_PROGRESS",
                now.toString(),
                expires.toString(),
                safeQuestions
        );
        ACTIVE_ATTEMPTS.put(attemptId, attempt);
        return attempt;
    }

    public static AttemptDto getActiveAttempt(int attemptId) {
        return ACTIVE_ATTEMPTS.get(attemptId);
    }

    public static List<AttemptResultDto> getResultsForUser(int userId) {
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection()) {
                List<AttemptResultDto> list = new ArrayList<>();
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT id, user_id, season_id, round_id, exam_id, round_title, exam_title, exam_order, score, correct_count, total_questions, duration_seconds, mode, submitted_at FROM attempts WHERE user_id = ? AND status = 'SUBMITTED' ORDER BY id DESC")) {
                    ps.setInt(1, userId);
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            int attId = rs.getInt("id");
                            List<AttemptResultDto.QuestionReviewItem> rev = new ArrayList<>();
                            try (PreparedStatement aps = conn.prepareStatement(
                                    "SELECT question_id, choice_id, is_correct FROM attempt_answers WHERE attempt_id = ? ORDER BY id ASC")) {
                                aps.setInt(1, attId);
                                try (ResultSet ars = aps.executeQuery()) {
                                    while (ars.next()) {
                                        int cId = ars.getInt("choice_id");
                                        Integer choiceObj = ars.wasNull() ? null : cId;
                                        rev.add(new AttemptResultDto.QuestionReviewItem(
                                                ars.getInt("question_id"),
                                                ars.getBoolean("is_correct"),
                                                choiceObj
                                        ));
                                    }
                                }
                            }
                            list.add(new AttemptResultDto(
                                    attId,
                                    rs.getInt("user_id"),
                                    rs.getString("season_id"),
                                    rs.getInt("round_id"),
                                    rs.getInt("exam_id"),
                                    rs.getString("round_title"),
                                    rs.getString("exam_title"),
                                    rs.getInt("exam_order"),
                                    rs.getInt("score"),
                                    rs.getInt("correct_count"),
                                    rs.getInt("total_questions"),
                                    rs.getString("submitted_at"),
                                    rs.getInt("duration_seconds"),
                                    rs.getString("mode"),
                                    rev
                            ));
                        }
                    }
                }
                return list;
            } catch (Exception e) {
                System.err.println("[MariaDB] getResultsForUser error: " + e.getMessage());
            }
        }
        return USER_RESULTS.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
    }

    public static void addResultForUser(int userId, AttemptResultDto result) {
        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection()) {
                int savedAttemptId = result.getAttemptId();
                try (PreparedStatement ps = conn.prepareStatement(
                        "INSERT INTO attempts (user_id, season_id, round_id, exam_id, round_title, exam_title, exam_order, status, mode, score, correct_count, total_questions, duration_seconds, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, userId);
                    ps.setString(2, result.getSeasonId() != null ? result.getSeasonId() : "2026-2027");
                    ps.setInt(3, result.getRoundId());
                    ps.setInt(4, result.getExamId() != null ? result.getExamId() : 201);
                    ps.setString(5, result.getRoundTitle());
                    ps.setString(6, result.getExamTitle() != null ? result.getExamTitle() : "Bài 1");
                    ps.setInt(7, result.getExamOrder() != null ? result.getExamOrder() : 1);
                    ps.setString(8, result.getMode() != null ? result.getMode() : "exam");
                    ps.setInt(9, result.getScore());
                    ps.setInt(10, result.getCorrectCount());
                    ps.setInt(11, result.getTotalQuestions());
                    ps.setInt(12, result.getDurationSeconds() != null ? result.getDurationSeconds() : 420);
                    ps.setString(13, result.getSubmittedAt());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (keys.next()) {
                            savedAttemptId = keys.getInt(1);
                            result.setAttemptId(savedAttemptId);
                        }
                    }
                }

                if (result.getReview() != null) {
                    try (PreparedStatement aps = conn.prepareStatement(
                            "INSERT INTO attempt_answers (attempt_id, question_id, choice_id, is_correct) VALUES (?, ?, ?, ?)")) {
                        for (AttemptResultDto.QuestionReviewItem item : result.getReview()) {
                            aps.setInt(1, savedAttemptId);
                            aps.setInt(2, item.getQuestionId());
                            if (item.getChoiceId() != null) {
                                aps.setInt(3, item.getChoiceId());
                            } else {
                                aps.setNull(3, java.sql.Types.INTEGER);
                            }
                            aps.setBoolean(4, item.isCorrect());
                            aps.addBatch();
                        }
                        aps.executeBatch();
                    }
                }

                // Kiểm tra nếu đã hoàn thành đủ 3 bài của vòng này -> chuyển vòng sang COMPLETED
                // và TỰ ĐỘNG MỞ KHÓA vòng tiếp theo liên kết qua prerequisite_round_id
                try (PreparedStatement checkPs = conn.prepareStatement(
                        "SELECT COUNT(DISTINCT exam_order) AS done_cnt, COALESCE(SUM(score), 0) AS total_round_score FROM attempts WHERE user_id = ? AND round_id = ? AND mode = 'exam'")) {
                    checkPs.setInt(1, userId);
                    checkPs.setInt(2, result.getRoundId());
                    try (ResultSet crs = checkPs.executeQuery()) {
                        if (crs.next() && crs.getInt("done_cnt") >= 3) {
                            int roundScore = crs.getInt("total_round_score");
                            try (PreparedStatement upRound = conn.prepareStatement(
                                    "UPDATE rounds SET status = 'COMPLETED' WHERE id = ?")) {
                                upRound.setInt(1, result.getRoundId());
                                upRound.executeUpdate();
                            }
                            try (PreparedStatement unlockNext = conn.prepareStatement(
                                    "UPDATE rounds SET status = 'IN_PROGRESS', is_open = TRUE WHERE prerequisite_round_id = ? AND status = 'LOCKED'")) {
                                unlockNext.setInt(1, result.getRoundId());
                                unlockNext.executeUpdate();
                            }
                            try (PreparedStatement upSeason = conn.prepareStatement(
                                    "UPDATE seasons SET highest_score = GREATEST(highest_score, ?) WHERE id = ?")) {
                                upSeason.setInt(1, roundScore);
                                upSeason.setString(2, result.getSeasonId() != null ? result.getSeasonId() : "2026-2027");
                                upSeason.executeUpdate();
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] addResultForUser error: " + e.getMessage());
            }
        }

        List<AttemptResultDto> list = USER_RESULTS.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
        list.add(0, result);
    }

    /**
     * Lấy toàn bộ dữ liệu khởi tạo cho các màn hình của User từ MariaDB:
     * seasons, rounds, exams, questions, attempts (của userId), teacherAssignments, studentInfo.
     */
    public static Map<String, Object> getUserBootstrapData(int userId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        UserDto user = findUserById(userId);
        if (user == null) {
            user = new UserDto(1, "user", "Nguyễn Văn A", "USER");
        }

        int coins = 120;
        int streakDays = 5;
        List<Map<String, Object>> seasonsList = new ArrayList<>();
        List<Map<String, Object>> examsList = new ArrayList<>();
        List<Map<String, Object>> assignmentsList = new ArrayList<>();

        if (DatabaseManager.isMariaDbAvailable()) {
            try (Connection conn = DatabaseManager.getConnection()) {
                try (PreparedStatement ps = conn.prepareStatement("SELECT coins, streak_days FROM users WHERE id = ?")) {
                    ps.setInt(1, user.getId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            coins = rs.getInt("coins");
                            streakDays = rs.getInt("streak_days");
                        }
                    }
                }

                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT id, name, status, start_date, end_date, total_rounds_participated, highest_score, description FROM seasons");
                     ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> s = new LinkedHashMap<>();
                        s.put("id", rs.getString("id"));
                        s.put("name", rs.getString("name"));
                        s.put("status", rs.getString("status"));
                        s.put("startDate", rs.getString("start_date"));
                        s.put("endDate", rs.getString("end_date"));
                        s.put("totalRoundsParticipated", rs.getInt("total_rounds_participated"));
                        s.put("highestScore", rs.getInt("highest_score"));
                        s.put("description", rs.getString("description"));
                        seasonsList.add(s);
                    }
                }

                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT id, round_id, exam_order, title, question_count, duration_minutes FROM exams ORDER BY id ASC");
                     ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> ex = new LinkedHashMap<>();
                        ex.put("id", rs.getInt("id"));
                        ex.put("roundId", rs.getInt("round_id"));
                        ex.put("order", rs.getInt("exam_order"));
                        ex.put("title", rs.getString("title"));
                        ex.put("questionCount", rs.getInt("question_count"));
                        ex.put("durationMinutes", rs.getInt("duration_minutes"));
                        examsList.add(ex);
                    }
                }

                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT id, title, question_count, duration_minutes, deadline, is_completed, score, exam_id, round_id FROM teacher_assignments ORDER BY id ASC");
                     ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> ta = new LinkedHashMap<>();
                        ta.put("id", rs.getInt("id"));
                        ta.put("title", rs.getString("title"));
                        ta.put("questionCount", rs.getInt("question_count"));
                        ta.put("durationMinutes", rs.getInt("duration_minutes"));
                        ta.put("deadline", rs.getString("deadline"));
                        ta.put("isCompleted", rs.getBoolean("is_completed"));
                        int sc = rs.getInt("score");
                        if (!rs.wasNull()) ta.put("score", sc);
                        ta.put("examId", rs.getInt("exam_id"));
                        ta.put("roundId", rs.getInt("round_id"));
                        assignmentsList.add(ta);
                    }
                }
            } catch (Exception e) {
                System.err.println("[MariaDB] getUserBootstrapData error: " + e.getMessage());
            }
        }

        Map<String, Object> studentMap = new LinkedHashMap<>();
        studentMap.put("name", user.getFullName());
        studentMap.put("role", "TEACHER".equals(user.getRole()) ? "Giáo viên" : "ADMIN".equals(user.getRole()) ? "Quản trị" : "Học sinh");
        studentMap.put("coins", coins);
        studentMap.put("streakDays", streakDays);

        payload.put("databaseConnected", DatabaseManager.isMariaDbAvailable());
        payload.put("student", studentMap);
        payload.put("seasons", seasonsList);
        payload.put("rounds", getRounds());
        payload.put("exams", examsList);
        payload.put("questions", getQuestions());
        payload.put("attempts", getResultsForUser(user.getId()));
        payload.put("teacherAssignments", assignmentsList);
        return payload;
    }
}

package com.memestudy.backend.store;

import com.memestudy.backend.model.AttemptDto;
import com.memestudy.backend.model.AttemptResultDto;
import com.memestudy.backend.model.ChoiceDto;
import com.memestudy.backend.model.QuestionDto;
import com.memestudy.backend.model.RoundDto;
import com.memestudy.backend.model.UserDto;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Kho dữ liệu trung tâm của Backend MeMeStudy.
 * Khởi tạo sẵn tài khoản (user / 123456, admin / 123456), các vòng thi,
 * ngân hàng câu hỏi và lịch sử thi mẫu khớp với Frontend (FE-1, FE-3, FE-6, FE-8).
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
        initAccounts();
        initRounds();
        initQuestions();
        initSeedResults();
    }

    private static void initAccounts() {
        ACCOUNTS.add(new AccountRecord(
                new UserDto(1, "user", "Nguyễn Văn A", "USER"),
                BCrypt.hashpw("123456", BCrypt.gensalt())
        ));
        ACCOUNTS.add(new AccountRecord(
                new UserDto(2, "admin", "Quản trị viên", "ADMIN"),
                BCrypt.hashpw("123456", BCrypt.gensalt())
        ));
    }

    private static void initRounds() {
        ROUNDS.add(new RoundDto(
                1,
                "2026-2027",
                1,
                "01",
                "COMPLETED",
                "Vòng 01 — Khởi động",
                "Từ vựng gia đình, trường học & chào hỏi cơ bản",
                15,
                10,
                true
        ));
        ROUNDS.add(new RoundDto(
                2,
                "2026-2027",
                2,
                "02",
                "IN_PROGRESS",
                "Vòng 02 — Khám phá",
                "Chủ đề sở thích (Hobbies), hoạt động hàng ngày & ngữ pháp hiện tại đơn",
                15,
                10,
                true
        ));
        ROUNDS.add(new RoundDto(
                3,
                "2026-2027",
                3,
                "03",
                "LOCKED",
                "Vòng 03 — Chinh phục",
                "Giao tiếp nâng cao, miêu tả thiên nhiên & đọc hiểu ngắn",
                15,
                10,
                false
        ));
    }

    private static void initQuestions() {
        QUESTIONS.add(new QuestionDto(
                20101,
                "Choose the best word: My brother loves playing _____ after school.",
                Arrays.asList(
                        new ChoiceDto(201011, "homework"),
                        new ChoiceDto(201012, "badminton"),
                        new ChoiceDto(201013, "kitchen"),
                        new ChoiceDto(201014, "pencil")
                ),
                201012,
                "Sau động từ 'playing' cần một môn thể thao: 'badminton' (cầu lông)."
        ));
        QUESTIONS.add(new QuestionDto(
                20102,
                "What hobby is this? 'I use a camera to take nice pictures.'",
                Arrays.asList(
                        new ChoiceDto(201021, "Cooking"),
                        new ChoiceDto(201022, "Swimming"),
                        new ChoiceDto(201023, "Photography"),
                        new ChoiceDto(201024, "Gardening")
                ),
                201023,
                "'Use a camera to take nice pictures' là sở thích chụp ảnh (Photography)."
        ));
        QUESTIONS.add(new QuestionDto(
                20103,
                "Listen and choose the correct sentence: 'She enjoys reading comic books.'",
                Arrays.asList(
                        new ChoiceDto(201031, "She enjoys reading comic books."),
                        new ChoiceDto(201032, "She is riding a new bike."),
                        new ChoiceDto(201033, "He likes watching cartoons."),
                        new ChoiceDto(201034, "They are playing chess.")
                ),
                201031,
                "Cấu trúc 'enjoy + V-ing': 'She enjoys reading comic books.'"
        ));
        QUESTIONS.add(new QuestionDto(
                20104,
                "Which word means 'Collecting stamps'?",
                Arrays.asList(
                        new ChoiceDto(201041, "Sưu tầm tem"),
                        new ChoiceDto(201042, "Vẽ tranh phong cảnh"),
                        new ChoiceDto(201043, "Chơi đàn guitar"),
                        new ChoiceDto(201044, "Trồng hoa ban công")
                ),
                201041,
                "'Collect stamps' có nghĩa là sưu tầm tem."
        ));
        QUESTIONS.add(new QuestionDto(
                20105,
                "We need a swimsuit and goggles to go _____.",
                Arrays.asList(
                        new ChoiceDto(201051, "shopping"),
                        new ChoiceDto(201052, "swimming"),
                        new ChoiceDto(201053, "cooking"),
                        new ChoiceDto(201054, "singing")
                ),
                201052,
                "Đồ bơi (swimsuit) và kính bơi (goggles) dùng khi đi bơi (go swimming)."
        ));
        QUESTIONS.add(new QuestionDto(
                20106,
                "My sister is very good _____ drawing animals.",
                Arrays.asList(
                        new ChoiceDto(201061, "in"),
                        new ChoiceDto(201062, "on"),
                        new ChoiceDto(201063, "at"),
                        new ChoiceDto(201064, "with")
                ),
                201063,
                "Cấu trúc 'be good at + V-ing / N': giỏi về việc gì đó."
        ));
        QUESTIONS.add(new QuestionDto(
                20107,
                "Where do people usually go to borrow books?",
                Arrays.asList(
                        new ChoiceDto(201071, "Library"),
                        new ChoiceDto(201072, "Bakery"),
                        new ChoiceDto(201073, "Hospital"),
                        new ChoiceDto(201074, "Airport")
                ),
                201071,
                "Thư viện (Library) là nơi mượn và đọc sách."
        ));
        QUESTIONS.add(new QuestionDto(
                20108,
                "Odd one out (Tìm từ khác nhóm):",
                Arrays.asList(
                        new ChoiceDto(201081, "Football"),
                        new ChoiceDto(201082, "Volleyball"),
                        new ChoiceDto(201083, "Basketball"),
                        new ChoiceDto(201084, "Sandwich")
                ),
                201084,
                "'Sandwich' là đồ ăn, còn lại đều là các môn thể thao bóng."
        ));
        QUESTIONS.add(new QuestionDto(
                20109,
                "Nam: 'How often do you play chess?' — Mai: '_____'",
                Arrays.asList(
                        new ChoiceDto(201091, "Twice a week."),
                        new ChoiceDto(201092, "In the living room."),
                        new ChoiceDto(201093, "With my grandfather."),
                        new ChoiceDto(201094, "Yes, I do.")
                ),
                201091,
                "Câu hỏi 'How often' hỏi tần suất, trả lời 'Twice a week' (2 lần một tuần)."
        ));
        QUESTIONS.add(new QuestionDto(
                20110,
                "Playing sports helps us stay _____ and strong.",
                Arrays.asList(
                        new ChoiceDto(201101, "healthy"),
                        new ChoiceDto(201102, "sleepy"),
                        new ChoiceDto(201103, "hungry"),
                        new ChoiceDto(201104, "noisy")
                ),
                201101,
                "'Stay healthy and strong' nghĩa là giữ cơ thể khỏe mạnh và dẻo dai."
        ));
    }

    private static void initSeedResults() {
        List<AttemptResultDto> user1Results = new CopyOnWriteArrayList<>();
        user1Results.add(new AttemptResultDto(
                1001, 1, "Vòng 01 — Khởi động", 90, 9, 10, "2026-09-10T08:30:00.000Z", createSeedReview(9)
        ));
        user1Results.add(new AttemptResultDto(
                1002, 1, "Vòng 01 — Khởi động", 80, 8, 10, "2026-09-12T09:15:00.000Z", createSeedReview(8)
        ));
        user1Results.add(new AttemptResultDto(
                1003, 1, "Vòng 01 — Khởi động", 100, 10, 10, "2026-09-15T14:20:00.000Z", createSeedReview(10)
        ));
        user1Results.add(new AttemptResultDto(
                9001, 101, "Vòng 14 — Về đích", 100, 10, 10, "2026-04-12T09:20:00.000Z", createSeedReview(10)
        ));
        user1Results.add(new AttemptResultDto(
                9002, 101, "Vòng 14 — Về đích", 90, 9, 10, "2026-04-12T09:40:00.000Z", createSeedReview(9)
        ));
        user1Results.add(new AttemptResultDto(
                9003, 101, "Vòng 14 — Về đích", 90, 9, 10, "2026-04-12T10:05:00.000Z", createSeedReview(9)
        ));
        USER_RESULTS.put(1, user1Results);
    }

    private static List<AttemptResultDto.QuestionReviewItem> createSeedReview(int correctCount) {
        List<AttemptResultDto.QuestionReviewItem> items = new ArrayList<>();
        for (int i = 0; i < QUESTIONS.size(); i++) {
            QuestionDto q = QUESTIONS.get(i);
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
        for (AccountRecord acc : ACCOUNTS) {
            if (acc.getUser().getUsername().equalsIgnoreCase(clean)) {
                return acc;
            }
        }
        return null;
    }

    public static UserDto findUserById(Integer userId) {
        if (userId == null) return null;
        for (AccountRecord acc : ACCOUNTS) {
            if (acc.getUser().getId() == userId) {
                return acc.getUser();
            }
        }
        return null;
    }

    public static UserDto registerUser(String username, String password, String fullName) {
        int id = NEXT_USER_ID.getAndIncrement();
        UserDto user = new UserDto(id, username.trim(), fullName.trim(), "USER");
        String hash = BCrypt.hashpw(password, BCrypt.gensalt());
        ACCOUNTS.add(new AccountRecord(user, hash));
        USER_RESULTS.put(id, new CopyOnWriteArrayList<>());
        return user;
    }

    public static List<RoundDto> getRounds() {
        return Collections.unmodifiableList(ROUNDS);
    }

    public static RoundDto findRoundById(int roundId) {
        for (RoundDto r : ROUNDS) {
            if (r.getId() == roundId) return r;
        }
        return null;
    }

    public static List<QuestionDto> getQuestions() {
        return Collections.unmodifiableList(QUESTIONS);
    }

    public static QuestionDto findQuestionById(int questionId) {
        for (QuestionDto q : QUESTIONS) {
            if (q.getId() == questionId) return q;
        }
        return null;
    }

    public static AttemptDto createAttempt(int userId, RoundDto round) {
        int attemptId = NEXT_ATTEMPT_ID.getAndIncrement();
        Instant now = Instant.now();
        Instant expires = now.plusSeconds(round.getDurationMinutes() * 60L);
        List<QuestionDto> safeQuestions = new ArrayList<>();
        for (QuestionDto q : QUESTIONS) {
            safeQuestions.add(q.withoutAnswer());
        }
        AttemptDto attempt = new AttemptDto(
                attemptId,
                userId,
                round.getId(),
                round.getTitle(),
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
        return USER_RESULTS.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
    }

    public static void addResultForUser(int userId, AttemptResultDto result) {
        List<AttemptResultDto> list = USER_RESULTS.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
        list.add(0, result);
    }
}


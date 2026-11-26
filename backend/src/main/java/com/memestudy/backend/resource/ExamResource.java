package com.memestudy.backend.resource;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.memestudy.backend.ai.ExamImportService;
import com.memestudy.backend.ai.ExamImportService.DraftQuestion;
import com.memestudy.backend.db.DatabaseManager;
import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.model.RoundDto;
import com.memestudy.backend.model.UserDto;
import com.memestudy.backend.security.JwtUtil;
import com.memestudy.backend.store.InMemoryStore;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Quản lý đề cho giáo viên / quản trị (/api/exams).
 *
 * GET    /api/exams           → danh sách bài thi (source = ROUND | TEACHER)
 * POST   /api/exams/import    body { fileName, mimeType, dataBase64 } → Gemini đọc file, trả bản nháp (chưa lưu)
 * POST   /api/exams           body { roundId, title, durationMinutes, deadline?, questions[] } → lưu đề + giao cho học sinh
 * DELETE /api/exams/{id}      → xoá đề giáo viên tải lên
 *
 * Tất cả đều cần đăng nhập bằng tài khoản TEACHER hoặc ADMIN.
 */
@Path("/exams")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExamResource {

    private static final DateTimeFormatter DEADLINE_FORMAT = DateTimeFormatter.ofPattern("dd/MM");

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ImportRequest {
        private String fileName;
        private String mimeType;
        private String dataBase64;

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
        public String getDataBase64() { return dataBase64; }
        public void setDataBase64(String dataBase64) { this.dataBase64 = dataBase64; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CreateRequest {
        private Integer roundId;
        private String title;
        private Integer durationMinutes;
        private String deadline;
        private List<DraftQuestion> questions;

        public Integer getRoundId() { return roundId; }
        public void setRoundId(Integer roundId) { this.roundId = roundId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }
        public List<DraftQuestion> getQuestions() { return questions; }
        public void setQuestions(List<DraftQuestion> questions) { this.questions = questions; }
    }

    @GET
    public Response listExams(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Response denied = requireTeacher(authHeader);
        if (denied != null) return denied;
        Response noDb = requireDatabase();
        if (noDb != null) return noDb;
        try {
            return Response.ok(ApiResponse.ok(InMemoryStore.listExams())).build();
        } catch (Exception e) {
            System.err.println("[MariaDB] listExams error: " + e.getMessage());
            return error(Response.Status.INTERNAL_SERVER_ERROR, "Không đọc được danh sách đề.");
        }
    }

    @POST
    @Path("/import")
    public Response importFile(ImportRequest body, @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Response denied = requireTeacher(authHeader);
        if (denied != null) return denied;
        if (body == null || body.getDataBase64() == null || body.getDataBase64().isBlank()) {
            return error(Response.Status.BAD_REQUEST, "Chưa có file đề.");
        }

        String b64 = body.getDataBase64().trim();
        int comma = b64.indexOf(',');
        if (b64.startsWith("data:") && comma > 0) {
            b64 = b64.substring(comma + 1); // bỏ tiền tố "data:application/pdf;base64,"
        }
        // Ước lượng kích thước trước khi giải mã để không tốn bộ nhớ với file quá lớn
        if ((long) b64.length() * 3 / 4 > ExamImportService.MAX_FILE_BYTES + 4) {
            return error(Response.Status.REQUEST_ENTITY_TOO_LARGE, "File quá lớn (tối đa 8 MB).");
        }
        byte[] data;
        try {
            data = Base64.getMimeDecoder().decode(b64);
        } catch (IllegalArgumentException e) {
            return error(Response.Status.BAD_REQUEST, "Dữ liệu file không hợp lệ.");
        }

        try {
            Map<String, Object> draft = ExamImportService.parse(body.getFileName(), body.getMimeType(), data);
            return Response.ok(ApiResponse.ok(draft)).build();
        } catch (ExamImportService.ImportException e) {
            return Response.status(e.getStatus()).entity(ApiResponse.error(e.getMessage())).build();
        }
    }

    @POST
    public Response createExam(CreateRequest body, @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Response denied = requireTeacher(authHeader);
        if (denied != null) return denied;
        Response noDb = requireDatabase();
        if (noDb != null) return noDb;
        if (body == null) return error(Response.Status.BAD_REQUEST, "Thiếu dữ liệu đề.");

        RoundDto round = body.getRoundId() == null ? null : InMemoryStore.findRoundById(body.getRoundId());
        if (round == null) return error(Response.Status.BAD_REQUEST, "Hãy chọn vòng thi cho đề.");
        if (!round.getIsOpen() || "LOCKED".equalsIgnoreCase(round.getStatus())) {
            return error(Response.Status.BAD_REQUEST, "Vòng thi này đang khoá — học sinh chưa làm được. Hãy chọn vòng đang mở.");
        }

        String title = body.getTitle() == null ? "" : body.getTitle().trim();
        if (title.isEmpty()) return error(Response.Status.BAD_REQUEST, "Hãy nhập tên đề.");
        if (title.length() > 180) title = title.substring(0, 180);

        int duration = body.getDurationMinutes() == null ? 15 : body.getDurationMinutes();
        if (duration < 1 || duration > 180) return error(Response.Status.BAD_REQUEST, "Thời gian làm bài từ 1 đến 180 phút.");

        String deadline = body.getDeadline() == null ? "" : body.getDeadline().trim();
        if (deadline.isEmpty()) deadline = LocalDate.now().plusDays(7).format(DEADLINE_FORMAT);
        if (deadline.length() > 20) deadline = deadline.substring(0, 20);

        // Kiểm tra lại từng câu (không tin dữ liệu gửi lên, dù đã qua AI và giáo viên)
        List<DraftQuestion> questions = new ArrayList<>();
        List<DraftQuestion> input = body.getQuestions() == null ? List.of() : body.getQuestions();
        if (input.isEmpty()) return error(Response.Status.BAD_REQUEST, "Đề cần ít nhất 1 câu hỏi.");
        if (input.size() > ExamImportService.MAX_QUESTIONS) {
            return error(Response.Status.BAD_REQUEST, "Đề tối đa " + ExamImportService.MAX_QUESTIONS + " câu.");
        }
        for (int i = 0; i < input.size(); i++) {
            DraftQuestion q = input.get(i);
            String label = "Câu " + (i + 1) + ": ";
            String content = q == null || q.getContent() == null ? "" : q.getContent().trim();
            if (content.isEmpty()) return error(Response.Status.BAD_REQUEST, label + "thiếu nội dung.");
            if (content.length() > 1000) return error(Response.Status.BAD_REQUEST, label + "nội dung quá dài (tối đa 1000 ký tự).");
            List<String> choices = new ArrayList<>();
            for (String c : q.getChoices() == null ? List.<String>of() : q.getChoices()) {
                String text = c == null ? "" : c.trim();
                if (text.isEmpty()) return error(Response.Status.BAD_REQUEST, label + "có lựa chọn bị trống.");
                if (text.length() > 500) return error(Response.Status.BAD_REQUEST, label + "lựa chọn quá dài (tối đa 500 ký tự).");
                choices.add(text);
            }
            if (choices.size() < 2 || choices.size() > 4) {
                return error(Response.Status.BAD_REQUEST, label + "cần từ 2 đến 4 lựa chọn.");
            }
            Integer correct = q.getCorrectIndex();
            if (correct == null || correct < 0 || correct >= choices.size()) {
                return error(Response.Status.BAD_REQUEST, label + "chưa chọn đáp án đúng.");
            }
            String explanation = q.getExplanation() == null ? "" : q.getExplanation().trim();
            if (explanation.length() > 1000) explanation = explanation.substring(0, 1000);

            DraftQuestion clean = new DraftQuestion();
            clean.setContent(content);
            clean.setChoices(choices);
            clean.setCorrectIndex(correct);
            clean.setExplanation(explanation);
            questions.add(clean);
        }

        UserDto teacher = currentUser(authHeader);
        try {
            Map<String, Object> created = InMemoryStore.createTeacherExam(
                    teacher.getId(), round.getId(), title, duration, deadline, questions);
            System.out.println("[Exam] " + teacher.getUsername() + " tạo đề #" + created.get("examId")
                    + " (" + questions.size() + " câu) cho vòng " + round.getId());
            return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(created)).build();
        } catch (Exception e) {
            System.err.println("[MariaDB] createTeacherExam error: " + e.getMessage());
            return error(Response.Status.INTERNAL_SERVER_ERROR, "Không lưu được đề vào database. Thử lại nhé.");
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteExam(@PathParam("id") int id, @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Response denied = requireTeacher(authHeader);
        if (denied != null) return denied;
        Response noDb = requireDatabase();
        if (noDb != null) return noDb;
        try {
            if (!InMemoryStore.deleteTeacherExam(id)) {
                return error(Response.Status.NOT_FOUND, "Không tìm thấy đề tải lên này (bài thi gốc của vòng không xoá được).");
            }
            return Response.ok(ApiResponse.ok(Map.of("deleted", id))).build();
        } catch (Exception e) {
            System.err.println("[MariaDB] deleteTeacherExam error: " + e.getMessage());
            return error(Response.Status.INTERNAL_SERVER_ERROR, "Không xoá được đề.");
        }
    }

    // ---------------------------------------------------------------- Helpers

    private static UserDto currentUser(String authHeader) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        return userId == null ? null : InMemoryStore.findUserById(userId);
    }

    /** null nếu là giáo viên / quản trị; ngược lại là Response 401/403. */
    private static Response requireTeacher(String authHeader) {
        UserDto user = currentUser(authHeader);
        if (user == null) return error(Response.Status.UNAUTHORIZED, "Bạn cần đăng nhập.");
        if (!"TEACHER".equalsIgnoreCase(user.getRole()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return error(Response.Status.FORBIDDEN, "Chỉ giáo viên hoặc quản trị mới quản lý được đề.");
        }
        return null;
    }

    private static Response requireDatabase() {
        if (DatabaseManager.isMariaDbAvailable()) return null;
        return error(Response.Status.SERVICE_UNAVAILABLE,
                "Chưa kết nối được MariaDB nên không lưu được đề. Kiểm tra MariaDB và backend/db.local.properties.");
    }

    private static Response error(Response.Status status, String message) {
        return Response.status(status).entity(ApiResponse.error(message)).build();
    }
}

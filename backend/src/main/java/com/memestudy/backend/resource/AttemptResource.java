package com.memestudy.backend.resource;

import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.model.AttemptDto;
import com.memestudy.backend.model.AttemptResultDto;
import com.memestudy.backend.model.QuestionDto;
import com.memestudy.backend.model.SubmitRequestDto;
import com.memestudy.backend.model.UserDto;
import com.memestudy.backend.security.JwtUtil;
import com.memestudy.backend.store.InMemoryStore;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Resource quản lý Lịch sử lượt thi & Nộp bài (/attempts)
 * - GET /api/attempts: trả về danh sách AttemptResult[] của user hiện tại (dùng cho useGetMyResultsQuery trên ProfileScreen FE-6 và HistoryScreen)
 * - POST /api/attempts/{attemptId}/submit: chấm điểm và lưu kết quả lượt thi
 * - GET /api/attempts/{attemptId}/review: xem lại chi tiết câu hỏi & đáp án của lượt thi
 */
@Path("/attempts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AttemptResource {

    @GET
    public Response getMyResults(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        UserDto user = InMemoryStore.findUserById(userId != null ? userId : 1);
        int targetUserId = user != null ? user.getId() : 1;

        List<AttemptResultDto> results = InMemoryStore.getResultsForUser(targetUserId);
        return Response.ok(ApiResponse.ok(results)).build();
    }

    @POST
    @Path("/{attemptId}/submit")
    public Response submitAttempt(
            @PathParam("attemptId") int attemptId,
            SubmitRequestDto body,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        AttemptDto attempt = InMemoryStore.getActiveAttempt(attemptId);
        if (attempt == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Không tìm thấy lượt thi."))
                    .build();
        }
        if (userId != null && attempt.getUserId() != userId) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(ApiResponse.error("Bạn không có quyền nộp lượt thi này."))
                    .build();
        }
        if ("SUBMITTED".equalsIgnoreCase(attempt.getStatus())) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(ApiResponse.error("Bài thi đã được nộp trước đó."))
                    .build();
        }

        attempt.setStatus("SUBMITTED");

        List<SubmitRequestDto.AnswerItem> submittedAnswers =
                body != null && body.getAnswers() != null ? body.getAnswers() : List.of();

        List<AttemptResultDto.QuestionReviewItem> review = new ArrayList<>();
        int correctCount = 0;

        for (QuestionDto q : attempt.getQuestions()) {
            QuestionDto fullQuestion = InMemoryStore.findQuestionById(q.getId());
            Integer selectedChoiceId = null;
            for (SubmitRequestDto.AnswerItem ans : submittedAnswers) {
                if (ans.getQuestionId() == q.getId()) {
                    selectedChoiceId = ans.getChoiceId();
                    break;
                }
            }
            boolean isCorrect = fullQuestion != null
                    && fullQuestion.getCorrectChoiceId() != null
                    && selectedChoiceId != null
                    && fullQuestion.getCorrectChoiceId().equals(selectedChoiceId);

            if (isCorrect) {
                correctCount++;
            }
            review.add(new AttemptResultDto.QuestionReviewItem(q.getId(), isCorrect, selectedChoiceId));
        }

        int totalQuestions = attempt.getQuestions().isEmpty() ? 10 : attempt.getQuestions().size();
        int score = correctCount * 10; // Thang điểm 100 (mỗi câu đúng = 10 điểm)
        String submittedAt = Instant.now().toString();

        AttemptResultDto result = new AttemptResultDto(
                attempt.getId(),
                attempt.getRoundId(),
                attempt.getRoundTitle(),
                score,
                correctCount,
                totalQuestions,
                submittedAt,
                review
        );

        InMemoryStore.addResultForUser(attempt.getUserId(), result);
        return Response.ok(ApiResponse.ok(result)).build();
    }

    @GET
    @Path("/{attemptId}/review")
    public Response getAttemptReview(
            @PathParam("attemptId") int attemptId,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        int targetUserId = userId != null ? userId : 1;

        List<AttemptResultDto> results = InMemoryStore.getResultsForUser(targetUserId);
        AttemptResultDto found = null;
        for (AttemptResultDto r : results) {
            if (r.getAttemptId() == attemptId) {
                found = r;
                break;
            }
        }
        if (found == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Không tìm thấy kết quả lượt thi."))
                    .build();
        }

        List<Map<String, Object>> reviewDetails = new ArrayList<>();
        List<QuestionDto> allQuestions = InMemoryStore.getQuestions();
        List<AttemptResultDto.QuestionReviewItem> reviewItems =
                found.getReview() != null ? found.getReview() : List.of();

        for (int i = 0; i < allQuestions.size(); i++) {
            QuestionDto q = allQuestions.get(i);
            AttemptResultDto.QuestionReviewItem item =
                    i < reviewItems.size() ? reviewItems.get(i) : null;

            Map<String, Object> row = new HashMap<>();
            row.put("questionId", q.getId());
            row.put("content", q.getContent());
            row.put("choices", q.getChoices());
            row.put("selectedChoiceId", item != null ? item.getChoiceId() : null);
            row.put("correctChoiceId", q.getCorrectChoiceId());
            row.put("explanation", q.getExplanation());
            reviewDetails.add(row);
        }

        return Response.ok(ApiResponse.ok(reviewDetails)).build();
    }
}


package com.memestudy.backend.resource;

import com.memestudy.backend.ai.AiExplainService;
import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.model.QuestionDto;
import com.memestudy.backend.security.JwtUtil;
import com.memestudy.backend.store.InMemoryStore;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/**
 * AI basic (/api/ai): Cú MeMe giải thích vì sao học sinh trả lời sai.
 *
 * POST /api/ai/explain  body: { "questionId": 2001, "selectedChoiceId": 20011 }
 *   → { "data": { "explanation": "...", "source": "ai" | "fallback", "provider"?: "gemini"|"claude", "notice"?: "..." } }
 * GET  /api/ai/status   → { "data": { "enabled": true|false, "provider": "gemini"|"claude"|null } }
 */
@Path("/ai")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AiResource {

    /** Body của POST /ai/explain. */
    public static class ExplainRequest {
        private Integer questionId;
        private Integer selectedChoiceId;

        public Integer getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Integer questionId) {
            this.questionId = questionId;
        }

        public Integer getSelectedChoiceId() {
            return selectedChoiceId;
        }

        public void setSelectedChoiceId(Integer selectedChoiceId) {
            this.selectedChoiceId = selectedChoiceId;
        }
    }

    @GET
    @Path("/status")
    public Response status() {
        AiExplainService.Provider provider = AiExplainService.activeProvider();
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("enabled", provider != null);
        body.put("provider", provider != null ? provider.name().toLowerCase() : null);
        return Response.ok(ApiResponse.ok(body)).build();
    }

    @POST
    @Path("/explain")
    public Response explain(ExplainRequest body, @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        // Gọi AI tốn phí → bắt buộc đăng nhập.
        if (JwtUtil.parseUserIdFromHeader(authHeader) == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Vui lòng đăng nhập để dùng trợ lý AI."))
                    .build();
        }
        if (body == null || body.getQuestionId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Thiếu questionId."))
                    .build();
        }

        QuestionDto question = InMemoryStore.findQuestionById(body.getQuestionId());
        if (question == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Không tìm thấy câu hỏi."))
                    .build();
        }

        AiExplainService.Explanation result = AiExplainService.explain(question, body.getSelectedChoiceId());
        return Response.ok(ApiResponse.ok(result.toMap())).build();
    }
}

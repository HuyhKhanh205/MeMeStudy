package com.memestudy.backend.resource;

import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.model.AttemptDto;
import com.memestudy.backend.model.RoundDto;
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
import java.util.HashMap;
import java.util.Map;

/**
 * REST Resource quản lý danh sách Vòng thi (/rounds) và bắt đầu lượt thi (/rounds/{id}/attempts)
 * Phục vụ HomeScreen, RoundListScreen, ExamScreen, ExamListScreen, DashboardScreen.
 */
@Path("/rounds")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoundResource {

    @GET
    public Response listRounds() {
        return Response.ok(ApiResponse.ok(InMemoryStore.getRounds())).build();
    }

    @GET
    @Path("/{id}")
    public Response getRound(@PathParam("id") int id) {
        RoundDto round = InMemoryStore.findRoundById(id);
        if (round == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Không tìm thấy vòng thi."))
                    .build();
        }
        return Response.ok(ApiResponse.ok(round)).build();
    }

    @POST
    @Path("/{roundId}/attempts")
    public Response startAttempt(
            @PathParam("roundId") int roundId,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        UserDto user = InMemoryStore.findUserById(userId != null ? userId : 1);
        if (user == null) {
            user = InMemoryStore.findUserById(1);
        }

        RoundDto round = InMemoryStore.findRoundById(roundId);
        if (round == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Không tìm thấy vòng thi."))
                    .build();
        }
        if (!round.getIsOpen() || "LOCKED".equalsIgnoreCase(round.getStatus())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Vòng thi này chưa mở."))
                    .build();
        }

        AttemptDto attempt = InMemoryStore.createAttempt(user.getId(), round);

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", attempt.getId());
        payload.put("roundId", attempt.getRoundId());
        payload.put("roundTitle", attempt.getRoundTitle());
        payload.put("status", attempt.getStatus());
        payload.put("startedAt", attempt.getStartedAt());
        payload.put("expiresAt", attempt.getExpiresAt());
        payload.put("questions", attempt.getQuestions());

        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(payload)).build();
    }
}


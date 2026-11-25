package com.memestudy.backend.resource;

import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.security.JwtUtil;
import com.memestudy.backend.store.InMemoryStore;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST Resource cung cấp toàn bộ dữ liệu thật từ MariaDB cho các màn hình Học sinh (User):
 * GET /api/user-data -> { seasons, rounds, exams, questions, attempts, teacherAssignments, student }
 */
@Path("/user-data")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserDataResource {

    @GET
    public Response getUserData(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        int targetUserId = userId != null ? userId : 1;
        return Response.ok(ApiResponse.ok(InMemoryStore.getUserBootstrapData(targetUserId))).build();
    }
}

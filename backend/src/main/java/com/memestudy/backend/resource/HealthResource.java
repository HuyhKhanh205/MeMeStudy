package com.memestudy.backend.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint kiểm tra trạng thái hoạt động của Backend
 * GET /api/health
 */
@Path("/health")
public class HealthResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkHealth() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "ok");
        result.put("message", "MeMeStudy Backend is running!");
        result.put("timestamp", System.currentTimeMillis());
        return Response.ok(result).build();
    }
}


package com.memestudy.backend.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Endpoint gốc của API (/api và /api/health)
 */
@Path("/")
public class HealthResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response apiIndex() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("message", "MeMeStudy Backend API is running on Apache Tomcat 10.1!");
        result.put("endpoints", List.of(
                "GET  /api/health",
                "GET  /api/rounds",
                "GET  /api/questions",
                "GET  /api/attempts",
                "POST /api/auth/login",
                "POST /api/auth/register",
                "GET  /api/auth/me",
                "GET  /api/auth/profile"
        ));
        return Response.ok(result).build();
    }

    @GET
    @Path("/health")
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkHealth() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("message", "MeMeStudy Backend is running!");
        result.put("timestamp", System.currentTimeMillis());
        return Response.ok(result).build();
    }
}

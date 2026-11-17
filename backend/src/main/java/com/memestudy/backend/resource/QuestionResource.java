package com.memestudy.backend.resource;

import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.store.InMemoryStore;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST Resource trả về danh sách câu hỏi (/questions)
 * Phục vụ QuestionListScreen và DashboardScreen.
 */
@Path("/questions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class QuestionResource {

    @GET
    public Response listQuestions() {
        return Response.ok(ApiResponse.ok(InMemoryStore.getQuestions())).build();
    }
}


package com.memestudy.backend.resource;

import com.memestudy.backend.model.ApiResponse;
import com.memestudy.backend.model.AttemptResultDto;
import com.memestudy.backend.model.UserDto;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.mindrot.jbcrypt.BCrypt;

/**
 * REST Resource xử lý Đăng nhập, Đăng ký, Thông tin người dùng hiện tại (/me)
 * và Hồ sơ cá nhân (/profile) phục vụ LoginScreen, RegisterScreen, AuthProvider và ProfileScreen (FE-6).
 */
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public static class LoginPayload {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterPayload {
        private String username;
        private String password;
        private String fullName;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }

    @POST
    @Path("/login")
    public Response login(LoginPayload body) {
        if (body == null
                || body.getUsername() == null
                || body.getUsername().isBlank()
                || body.getPassword() == null
                || body.getPassword().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Vui lòng nhập tên đăng nhập và mật khẩu."))
                    .build();
        }

        InMemoryStore.AccountRecord account = InMemoryStore.findByUsername(body.getUsername());
        if (account == null || !BCrypt.checkpw(body.getPassword(), account.getPasswordHash())) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Sai tên đăng nhập hoặc mật khẩu."))
                    .build();
        }

        UserDto user = account.getUser();
        String token = JwtUtil.generateToken(user);

        Map<String, Object> authData = new HashMap<>();
        authData.put("token", token);
        authData.put("user", user);
        return Response.ok(ApiResponse.ok(authData)).build();
    }

    @POST
    @Path("/register")
    public Response register(RegisterPayload body) {
        if (body == null
                || body.getFullName() == null
                || body.getFullName().isBlank()
                || body.getUsername() == null
                || body.getUsername().trim().length() < 3
                || body.getPassword() == null
                || body.getPassword().length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Thông tin đăng ký không hợp lệ (username >= 3 ký tự, mật khẩu >= 6 ký tự)."))
                    .build();
        }

        if (InMemoryStore.findByUsername(body.getUsername()) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(ApiResponse.error("Tên đăng nhập đã tồn tại."))
                    .build();
        }

        UserDto user = InMemoryStore.registerUser(
                body.getUsername(),
                body.getPassword(),
                body.getFullName()
        );
        String token = JwtUtil.generateToken(user);

        Map<String, Object> authData = new HashMap<>();
        authData.put("token", token);
        authData.put("user", user);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(authData)).build();
    }

    @GET
    @Path("/me")
    public Response me(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        UserDto user = InMemoryStore.findUserById(userId);
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Phiên đăng nhập đã hết hạn."))
                    .build();
        }
        return Response.ok(ApiResponse.ok(user)).build();
    }

    @GET
    @Path("/profile")
    public Response profile(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Integer userId = JwtUtil.parseUserIdFromHeader(authHeader);
        UserDto user = InMemoryStore.findUserById(userId != null ? userId : 1);
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Phiên đăng nhập đã hết hạn."))
                    .build();
        }

        List<AttemptResultDto> results = InMemoryStore.getResultsForUser(user.getId());
        int attemptCount = results.size();
        Double averageScore = null;
        if (attemptCount > 0) {
            double sum = 0;
            for (AttemptResultDto r : results) {
                sum += r.getScore();
            }
            averageScore = Math.round((sum / attemptCount) * 10.0) / 10.0;
        }

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("user", user);
        profileData.put("attemptCount", attemptCount);
        profileData.put("averageScore", averageScore);
        profileData.put("results", results);
        return Response.ok(ApiResponse.ok(profileData)).build();
    }
}


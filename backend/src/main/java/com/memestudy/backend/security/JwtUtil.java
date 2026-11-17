package com.memestudy.backend.security;

import com.memestudy.backend.model.UserDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

/**
 * Tiện ích tạo và xác thực JWT Token (JJWT 0.12.5)
 * Đồng thời tương thích ngược với token mock "mock-token-{userId}" từ frontend.
 */
public class JwtUtil {
    private static final String SECRET =
            "MeMeStudySecretKeyForJwtSigning2026_MustBeAtLeast32BytesLong!!";
    private static final SecretKey KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 ngày

    public static String generateToken(UserDto user) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("username", user.getUsername())
                .claim("role", user.getRole())
                .issuedAt(new Date(now))
                .expiration(new Date(now + EXPIRATION_MS))
                .signWith(KEY)
                .compact();
    }

    /**
     * Giải mã userId từ header Authorization ("Bearer <token>").
     * Trả về null nếu token không hợp lệ hoặc thiếu.
     */
    public static Integer parseUserIdFromHeader(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        String token = authHeader.trim();
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        if (token.isEmpty()) {
            return null;
        }
        // Tương thích cả token mock từ FE ("mock-token-1")
        if (token.startsWith("mock-token-")) {
            try {
                return Integer.parseInt(token.substring("mock-token-".length()).trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Integer.parseInt(claims.getSubject());
        } catch (Exception e) {
            return null;
        }
    }
}


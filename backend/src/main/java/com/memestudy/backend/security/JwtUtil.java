package com.memestudy.backend.security;

import com.memestudy.backend.config.AppConfig;
import com.memestudy.backend.model.UserDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

/**
 * Tiện ích tạo và xác thực JWT Token (JJWT 0.12.5).
 *
 * <p>Khoá ký lấy từ biến môi trường {@code JWT_SECRET} (≥ 32 byte). Khi chưa đặt và KHÔNG ở chế độ
 * {@code APP_ENV=production}, dùng khoá mặc định chỉ để chạy ở máy — khoá này nằm trên GitHub nên
 * tuyệt đối không dùng khi deploy (chế độ production sẽ từ chối khởi động nếu thiếu).
 *
 * <p>Token giả {@code mock-token-N} (từ chế độ mock của FE) bị từ chối, trừ khi chạy local với
 * {@code ALLOW_MOCK_TOKEN=true}: nếu chấp nhận, ai cũng giả được tài khoản bất kỳ (kể cả giáo viên).
 */
public class JwtUtil {
    private static final String LOCAL_DEV_SECRET =
            "MeMeStudySecretKeyForJwtSigning2026_MustBeAtLeast32BytesLong!!";
    private static final int MIN_SECRET_BYTES = 32;
    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 ngày

    private static final SecretKey KEY = Keys.hmacShaKeyFor(resolveSecret());
    private static final boolean ALLOW_MOCK_TOKEN =
            !AppConfig.isProduction() && AppConfig.flag("ALLOW_MOCK_TOKEN");

    private static byte[] resolveSecret() {
        String secret = AppConfig.env("JWT_SECRET");
        if (secret == null) {
            if (AppConfig.isProduction()) {
                throw new IllegalStateException(
                        "Thiếu biến môi trường JWT_SECRET (bắt buộc khi APP_ENV=production).");
            }
            System.err.println("[JWT] Chưa đặt JWT_SECRET → dùng khoá mặc định CHỈ ĐỂ CHẠY Ở MÁY. "
                    + "Khi deploy phải đặt JWT_SECRET riêng.");
            secret = LOCAL_DEV_SECRET;
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("JWT_SECRET phải dài ít nhất " + MIN_SECRET_BYTES + " byte.");
        }
        return bytes;
    }

    /** Gọi lúc khởi động để lỗi cấu hình (thiếu / quá ngắn JWT_SECRET) lộ ra ngay, không đợi tới lần đăng nhập đầu. */
    public static void checkConfig() {
        System.out.println("[JWT] Khoá ký đã sẵn sàng"
                + (ALLOW_MOCK_TOKEN ? " — ĐANG CHO PHÉP mock-token (chỉ dùng ở máy)." : "."));
    }

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
        if (token.startsWith("mock-token-")) {
            if (!ALLOW_MOCK_TOKEN) {
                return null;
            }
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

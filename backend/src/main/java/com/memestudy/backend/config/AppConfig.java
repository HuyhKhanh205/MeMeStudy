package com.memestudy.backend.config;

/**
 * Đọc cấu hình chạy backend từ biến môi trường (hoặc {@code -Dten=gia_tri} khi chạy bằng java/IntelliJ).
 *
 * <p>{@code APP_ENV=production} bật chế độ server (khi deploy):
 * <ul>
 *   <li>bắt buộc có {@code JWT_SECRET} riêng, không dùng khoá mặc định có trong mã nguồn;</li>
 *   <li>bắt buộc kết nối được database: không có DB thì backend dừng hẳn, không lặng lẽ lưu tạm trong RAM;</li>
 *   <li>không bao giờ chấp nhận token giả {@code mock-token-N}.</li>
 * </ul>
 * Chạy ở máy (không đặt APP_ENV) vẫn như cũ để tiện làm bài.
 */
public final class AppConfig {

    private AppConfig() {
    }

    /** Giá trị đã trim, hoặc {@code null} nếu chưa đặt / để trống. */
    public static String env(String name) {
        String v = System.getenv(name);
        if (v == null || v.isBlank()) {
            v = System.getProperty(name);
        }
        return v == null || v.isBlank() ? null : v.trim();
    }

    public static boolean flag(String name) {
        String v = env(name);
        return v != null && (v.equalsIgnoreCase("true") || v.equals("1") || v.equalsIgnoreCase("yes"));
    }

    public static boolean isProduction() {
        return "production".equalsIgnoreCase(env("APP_ENV"));
    }
}

package com.memestudy.backend.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Envelope phản hồi chuẩn của Backend:
 * - Thành công: { "data": ... }
 * - Lỗi: { "message": "...", "details": ... }
 */
public class ApiResponse {

    public static Map<String, Object> ok(Object data) {
        Map<String, Object> body = new HashMap<>();
        body.put("data", data);
        return body;
    }

    public static Map<String, Object> error(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        return body;
    }

    public static Map<String, Object> error(String message, Object details) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("details", details);
        return body;
    }
}


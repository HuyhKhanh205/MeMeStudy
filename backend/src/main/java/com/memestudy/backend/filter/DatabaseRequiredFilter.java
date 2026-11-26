package com.memestudy.backend.filter;

import com.memestudy.backend.config.AppConfig;
import com.memestudy.backend.db.DatabaseManager;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.util.Map;

/**
 * Chế độ production ({@code APP_ENV=production}): khi mất kết nối database thì trả 503 cho mọi API
 * (trừ /health), thay vì để InMemoryStore lặng lẽ đọc/ghi dữ liệu tạm trong RAM rồi mất khi khởi động lại.
 * Chạy ở máy (không đặt APP_ENV) giữ cách cũ: không có MariaDB vẫn chạy được bằng dữ liệu trong bộ nhớ.
 */
@Provider
public class DatabaseRequiredFilter implements ContainerRequestFilter {

    private static final boolean ENABLED = AppConfig.isProduction();

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!ENABLED || "OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            return;
        }
        String path = requestContext.getUriInfo().getPath();
        if (path == null || path.isEmpty() || "/".equals(path) || path.replaceAll("^/+", "").startsWith("health")) {
            return;
        }
        if (!DatabaseManager.isMariaDbAvailable()) {
            requestContext.abortWith(Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("message", "Máy chủ tạm thời không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau."))
                    .build());
        }
    }
}

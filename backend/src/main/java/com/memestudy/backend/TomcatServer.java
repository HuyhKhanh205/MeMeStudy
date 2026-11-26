package com.memestudy.backend;

import com.memestudy.backend.config.AppConfig;
import com.memestudy.backend.config.RestApplication;
import com.memestudy.backend.db.DatabaseManager;
import com.memestudy.backend.security.JwtUtil;
import java.io.File;
import org.apache.catalina.Context;
import org.apache.catalina.Wrapper;
import org.apache.catalina.startup.Tomcat;
import org.glassfish.jersey.servlet.ServletContainer;

/**
 * Khởi chạy Backend MeMeStudy trên Embedded Apache Tomcat 10.1 (Jakarta EE 10).
 * Có thể bấm trực tiếp nút Run (▶) trên file này trong IntelliJ IDEA
 * hoặc chạy bằng Maven: .\mvnw.cmd compile exec:java
 */
public class TomcatServer {

    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));

        // Kiểm tra cấu hình trước khi mở cổng: lỗi thì dừng ngay, log ghi rõ thiếu gì
        JwtUtil.checkConfig();
        boolean dbUp = DatabaseManager.isMariaDbAvailable();
        if (AppConfig.isProduction() && !dbUp) {
            System.err.println("[MariaDB] APP_ENV=production nhưng không kết nối được database "
                    + "→ dừng backend. Kiểm tra DB_URL / DB_USER / DB_PASSWORD.");
            System.exit(1);
        }
        if (!dbUp) {
            System.err.println("[MariaDB] Đang chạy KHÔNG có database: dữ liệu chỉ lưu trong bộ nhớ, mất khi tắt backend.");
        }

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        // Bắt buộc gọi getConnector() trên Tomcat 9/10/11 để kích hoạt HTTP connector
        tomcat.getConnector();

        File baseDir = new File("target/tomcat");
        if (!baseDir.exists()) {
            baseDir.mkdirs();
        }
        tomcat.setBaseDir(baseDir.getAbsolutePath());

        File docBase = new File("src/main/webapp");
        if (!docBase.exists()) {
            docBase = new File(".");
        }
        Context ctx = tomcat.addContext("", docBase.getAbsolutePath());

        // Đăng ký Jersey JAX-RS ServletContainer tại /api/*
        ServletContainer jerseyServlet = new ServletContainer(new RestApplication());
        Wrapper wrapper = Tomcat.addServlet(ctx, "JerseyServlet", jerseyServlet);
        wrapper.setLoadOnStartup(1);
        ctx.addServletMappingDecoded("/api/*", "JerseyServlet");

        tomcat.start();
        System.out.println("==========================================================");
        System.out.println("  MeMeStudy Backend (Apache Tomcat 10.1) is running!");
        System.out.println("  Health Check : http://localhost:" + port + "/api/health");
        System.out.println("  Rounds API   : http://localhost:" + port + "/api/rounds");
        System.out.println("  Attempts API : http://localhost:" + port + "/api/attempts");
        System.out.println("==========================================================");
        tomcat.getServer().await();
    }
}

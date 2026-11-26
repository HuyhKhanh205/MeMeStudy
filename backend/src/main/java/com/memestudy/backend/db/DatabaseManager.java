package com.memestudy.backend.db;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Quản lý kết nối JDBC tới MariaDB (database: memestudy).
 * Tự động đọc cấu hình từ db.properties hoặc biến môi trường (DB_URL, DB_USER, DB_PASSWORD),
 * và tự động khởi tạo bảng + dữ liệu từ database/memestudy_mariadb.sql nếu database mới tạo còn trống.
 */
public class DatabaseManager {

    private static String dbUrl =
            "jdbc:mariadb://localhost:3306/memestudy?useUnicode=true&characterEncoding=UTF-8&createDatabaseIfNotExist=true";
    private static String dbUser = "root";
    private static String dbPassword = "123456";
    private static volatile boolean initialized = false;
    private static volatile boolean mariaDbAvailable = false;

    static {
        loadConfig();
        initDatabase();
    }

    private static void loadConfig() {
        try {
            Class.forName("org.mariadb.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[MariaDB] Không tìm thấy org.mariadb.jdbc.Driver: " + e.getMessage());
        }

        Properties props = new Properties();
        try (InputStream in = DatabaseManager.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (in != null) {
                props.load(in);
                dbUrl = props.getProperty("db.url", dbUrl).trim();
                dbUser = props.getProperty("db.user", dbUser).trim();
                dbPassword = props.getProperty("db.password", dbPassword).trim();
            }
        } catch (Exception ignored) {
        }

        // Cấu hình riêng từng máy (mật khẩu MariaDB) — file db.local.properties nằm trong .gitignore,
        // đè lên db.properties (file này được commit nên KHÔNG ghi mật khẩu thật vào đó).
        String dir = System.getProperty("user.dir");
        for (File local : new File[] { new File(dir, "db.local.properties"), new File(dir, "backend/db.local.properties") }) {
            if (local.isFile()) {
                Properties localProps = new Properties();
                try (InputStreamReader r = new InputStreamReader(new FileInputStream(local), StandardCharsets.UTF_8)) {
                    localProps.load(r);
                    dbUrl = localProps.getProperty("db.url", dbUrl).trim();
                    dbUser = localProps.getProperty("db.user", dbUser).trim();
                    dbPassword = localProps.getProperty("db.password", dbPassword).trim();
                    System.out.println("[MariaDB] Loaded local DB config from " + local.getAbsolutePath());
                } catch (Exception e) {
                    System.err.println("[MariaDB] Cannot read " + local + ": " + e.getMessage());
                }
                break;
            }
        }

        String envUrl = System.getenv("DB_URL");
        String envUser = System.getenv("DB_USER");
        String envPass = System.getenv("DB_PASSWORD");
        if (envUrl != null && !envUrl.isBlank()) dbUrl = envUrl.trim();
        if (envUser != null && !envUser.isBlank()) dbUser = envUser.trim();
        if (envPass != null) dbPassword = envPass;
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    public static boolean isMariaDbAvailable() {
        if (!initialized) {
            initDatabase();
        }
        return mariaDbAvailable;
    }

    public static synchronized void initDatabase() {
        if (initialized && mariaDbAvailable) return;
        initialized = true;

        try (Connection conn = getConnection()) {
            mariaDbAvailable = true;
            boolean hasUsersTable = false;
            try (ResultSet rs = conn.getMetaData().getTables("memestudy", null, "users", null)) {
                if (rs.next()) {
                    hasUsersTable = true;
                }
            }

            if (!hasUsersTable) {
                System.out.println("[MariaDB] Chưa có bảng trong database 'memestudy', đang tự động nạp database/memestudy_mariadb.sql...");
                runSqlSeedScript(conn);
            }

            // Đảm bảo mật khẩu của 3 tài khoản mặc định (user, admin, teacher) luôn là BCrypt hợp lệ của "123456"
            ensureDefaultPasswords(conn);
            System.out.println("[MariaDB] Kết nối thành công tới: " + dbUrl);
        } catch (Exception e) {
            mariaDbAvailable = false;
            System.err.println("[MariaDB] Chưa kết nối được MariaDB (" + e.getMessage()
                    + "). Đảm bảo dịch vụ MariaDB đang chạy ở cổng 3306 và kiểm tra db.properties.");
        }
    }

    private static void runSqlSeedScript(Connection conn) {
        File[] candidates = new File[]{
                new File("../database/memestudy_mariadb.sql"),
                new File("database/memestudy_mariadb.sql"),
                new File("E:/HK7/ReactNative/groupProject/MeMeStudy/database/memestudy_mariadb.sql")
        };
        File sqlFile = null;
        for (File f : candidates) {
            if (f.exists() && f.isFile()) {
                sqlFile = f;
                break;
            }
        }
        if (sqlFile == null) {
            System.err.println("[MariaDB] Không tìm thấy file database/memestudy_mariadb.sql để tự nạp.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(sqlFile), StandardCharsets.UTF_8));
             Statement stmt = conn.createStatement()) {

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                    continue;
                }
                sb.append(line).append("\n");
                if (trimmed.endsWith(";")) {
                    String sql = sb.toString().trim();
                    sql = sql.substring(0, sql.length() - 1).trim();
                    sb.setLength(0);
                    if (!sql.isEmpty()) {
                        stmt.execute(sql);
                    }
                }
            }
            System.out.println("[MariaDB] Đã khởi tạo thành công toàn bộ bảng và dữ liệu từ: " + sqlFile.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("[MariaDB] Lỗi khi chạy script SQL: " + e.getMessage());
        }
    }

    private static void ensureDefaultPasswords(Connection conn) {
        // Tự động bổ sung cột gender, birth_date, class_name nếu bảng users cũ chưa có (mặc định rỗng cho user mới)
        try (Statement st = conn.createStatement()) {
            st.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NOT NULL DEFAULT ''");
            st.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20) NOT NULL DEFAULT ''");
            st.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS class_name VARCHAR(50) NOT NULL DEFAULT ''");
        } catch (Exception ignored) {
        }

        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT id, password_hash FROM users WHERE username IN ('user', 'admin', 'teacher')")) {
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int id = rs.getInt("id");
                    String hash = rs.getString("password_hash");
                    boolean valid = false;
                    try {
                        valid = hash != null && BCrypt.checkpw("123456", hash);
                    } catch (Exception ignored) {
                    }
                    if (!valid) {
                        String newHash = BCrypt.hashpw("123456", BCrypt.gensalt());
                        try (PreparedStatement up = conn.prepareStatement(
                                "UPDATE users SET password_hash = ? WHERE id = ?")) {
                            up.setString(1, newHash);
                            up.setInt(2, id);
                            up.executeUpdate();
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }
}

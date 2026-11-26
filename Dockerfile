# Backend MeMeStudy (Java 17 + Tomcat 10.1 nhúng + Jersey) — dùng để deploy (Railway / Render / VPS).
# Build ở thư mục gốc repo vì image cần cả database/memestudy_mariadb.sql:
#   docker build -t memestudy-api .
#   docker run -p 8090:8080 --env-file <file-bien-moi-truong> memestudy-api
# Biến môi trường cần đặt: xem docs/ke-hoach-hoan-thien-va-deploy.md (mục 3.4).

# ---------- Bước 1: biên dịch + gom thư viện ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Tải trước phần lớn thư viện (được cache, chỉ tải lại khi pom.xml đổi)
COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

COPY backend/src ./src
RUN mvn -B -q compile dependency:copy-dependencies \
        -DincludeScope=runtime -DoutputDirectory=target/lib

# ---------- Bước 2: image chạy (chỉ JRE, không có Maven / mã nguồn) ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Không chạy bằng root
RUN useradd --system --create-home --uid 10001 memestudy

COPY --from=build /build/target/classes ./classes
COPY --from=build /build/target/lib ./lib
# TomcatServer dùng src/main/webapp làm thư mục gốc (trang /index.html)
COPY backend/src/main/webapp ./src/main/webapp
# Script tạo bảng + dữ liệu mẫu, tự nạp khi database còn trống
COPY database/memestudy_mariadb.sql ./database/memestudy_mariadb.sql

RUN mkdir -p target/tomcat && chown -R memestudy:memestudy /app
USER memestudy

# Mặc định chạy chế độ production: bắt buộc có JWT_SECRET + database, chặn mock-token.
# Các biến bí mật (JWT_SECRET, DB_URL, DB_USER, DB_PASSWORD, GOOGLE_API_KEY) đặt ở dịch vụ deploy, KHÔNG ghi vào đây.
ENV APP_ENV=production \
    PORT=8080 \
    DB_INIT_SCRIPT=/app/database/memestudy_mariadb.sql

EXPOSE 8080

CMD ["java", "-XX:MaxRAMPercentage=75", "-Dfile.encoding=UTF-8", "-cp", "classes:lib/*", "com.memestudy.backend.TomcatServer"]

package com.memestudy.backend.config;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * Cấu hình ứng dụng RESTful API với Jersey JAX-RS
 * Đăng ký package chứa các Resource, Filter và Provider
 */
@ApplicationPath("/api")
public class RestApplication extends ResourceConfig {
    public RestApplication() {
        // Quét tự động các class trong các package tương ứng
        packages("com.memestudy.backend.resource",
                 "com.memestudy.backend.filter",
                 "com.memestudy.backend.exception");
    }
}


package com.zlang.zlang_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // This configuration allows any origin to access your API.
                // For a real production application, you would want to restrict this
                // to only the domain of your frontend application.
                registry.addMapping("/api/**") // Apply to all API endpoints
                        .allowedOrigins("*")   // Allow requests from any origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                        .allowedHeaders("*");  // Allow all headers
            }
        };
    }
}


package com.student.manager.config;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class TokenProvider {
    private static final String SECRET_SALT = "STUDENT_MANAGER_SECURE_2026_SALT";

    public String generateToken(String email) {
        long timestamp = System.currentTimeMillis();
        String payload = email + "::" + timestamp + "::" + SECRET_SALT;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    public String extractEmail(String token) {
        if (token == null || token.isBlank()) return null;
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            String payload = new String(decoded, StandardCharsets.UTF_8);
            String[] parts = payload.split("::");
            if (parts.length >= 3 && SECRET_SALT.equals(parts[2])) {
                return parts[0];
            }
        } catch (Exception e) {
            // Invalid token
        }
        return null;
    }
}

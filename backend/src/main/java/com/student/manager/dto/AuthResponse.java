package com.student.manager.dto;

public class AuthResponse {
    private String token;
    private String message;
    private UserProfileDto user;

    public AuthResponse() {}

    public AuthResponse(String token, String message, UserProfileDto user) {
        this.token = token;
        this.message = message;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UserProfileDto getUser() { return user; }
    public void setUser(UserProfileDto user) { this.user = user; }
}

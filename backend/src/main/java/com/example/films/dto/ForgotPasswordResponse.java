package com.example.films.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForgotPasswordResponse {
    private boolean success;
    private String message;
    private LocalDateTime timestamp;
    private String email;
    
    public ForgotPasswordResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ForgotPasswordResponse(boolean success, String message, String email) {
        this.success = success;
        this.message = message;
        this.email = email;
        this.timestamp = LocalDateTime.now();
    }
}





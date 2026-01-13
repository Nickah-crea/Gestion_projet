package com.example.films.dto;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String email;
    private String code;        // Code à 6 chiffres
    private String newPassword;
    private String confirmPassword;
}



package com.example.films.dto;

import lombok.Data;

@Data
public class UpdateProfilRequest {
    private String nom;
    private String email;
    private String specialite;
    private String biographie;
    private String currentPassword;
    private String newPassword;
}


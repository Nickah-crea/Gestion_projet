package com.example.films.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProfilUtilisateurDTO {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private String specialite;
    private String biographie;
    private String profilePhotoPath;
    private LocalDateTime creeLe;
    private LocalDateTime modifieLe;
}


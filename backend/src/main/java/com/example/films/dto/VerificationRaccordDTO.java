package com.example.films.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRaccordDTO {
    private Long id;
    private Long utilisateurId;
    private String utilisateurNom;
    private LocalDateTime dateVerification;
    private Long statutVerificationId;
    private String statutVerificationNom;
    private String notesVerification;
    private String preuveImage;
}
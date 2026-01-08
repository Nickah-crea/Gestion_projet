package com.example.films.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class RaccordAlerteDTO {
    private Long raccordId;
    private String description;
    private String typeRaccord;
    private boolean estCritique;
    private LocalDate dateTournageSource;
    private LocalDate dateTournageCible;
    private Long ecartJours;
    private boolean incoherenceChronologique;
    private List<String> messagesAlerte;
    private String niveauAlerte; 
    private String couleurStatut;

    private String sceneSourceTitre;
    private String sceneCibleTitre;
    private Long sceneSourceId;
    private Long sceneCibleId;

    public String getCouleurAlerte() {
        return switch (niveauAlerte) {
            case "CRITIQUE" -> "#dc3545";
            case "MOYEN" -> "#ffc107";
            case "FAIBLE" -> "#17a2b8";
            default -> "#6c757d";
        };
    }
}
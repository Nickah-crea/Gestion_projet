package com.example.films.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScenePlateauDTO {
    private Long id;
    private Long sceneId;
    private Long plateauId;
    private String descriptionUtilisation;
    private LocalDateTime creeLe;
    
    private String sceneTitre;
    private String sequenceTitre;
    private String episodeTitre;
    private String projetTitre;
    private String plateauNom;
    private String plateauType;
    private String lieuNom;
}
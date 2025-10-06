package com.example.films.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Getter
@Setter
public class SceneTournageDTO {
    private Long id;
    private Long sceneId;
    private String sceneTitre;
    private Long sequenceId;
    private String sequenceTitre;
    private Long episodeId;
    private String episodeTitre;
    private Long projetId;
    private String projetTitre;
    private LocalDate dateTournage;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Long lieuId;
    private String lieuNom;
    private Long plateauId;
    private String plateauNom;
    private String statutTournage;
    private String statutTournageLibelle;
    private String notes;
    private LocalDateTime creeLe;
    private LocalDateTime modifieLe;
    
    // Informations sur les comédiens
    private Integer nbComediens;
    private String nomsComediens;
}
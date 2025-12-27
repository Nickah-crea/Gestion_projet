// ScenaristeStatisticsDTO.java
package com.example.films.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ScenaristeStatisticsDTO {
    private Long userId;
    private String nom;
    private String email;
    
    // Statistiques productivité
    private Double productivite; // Pourcentage (0-100)
    private Integer scenesModifiees7j; // Scènes modifiées dans les 7 derniers jours
    private Integer tendanceScenes; // Variation en % (+15% ou -8%)
    private Integer tempsTotalMinutes; // Temps total en minutes ce mois
    private Integer moyenneQuotidienneMinutes; // Moyenne par jour
    private Integer sessionMoyenneMinutes; // Durée moyenne des sessions
    
    // Objectifs
    private ObjectifsDTO objectifs;
    
    // Détails temporels
    private Map<String, Integer> activitesParJour; // Activités par jour de la semaine
    private Integer heuresProductives; // Heures de travail productif
    private Integer joursActifs; // Nombre de jours avec activité
    
    // Timestamps
    private LocalDateTime dernierAcces;
    private LocalDateTime dateCalcul;
}


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
    
    
    private Double productivite; 
    private Integer scenesModifiees7j; 
    private Integer tendanceScenes; 
    private Integer tempsTotalMinutes; 
    private Integer moyenneQuotidienneMinutes;
    private Integer sessionMoyenneMinutes; 
    

    private ObjectifsDTO objectifs;
    

    private Map<String, Integer> activitesParJour; 
    private Integer heuresProductives; 
    private Integer joursActifs; 
    

    private LocalDateTime dernierAcces;
    private LocalDateTime dateCalcul;
}


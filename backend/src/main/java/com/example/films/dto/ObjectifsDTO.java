// ObjectifsDTO.java
package com.example.films.dto;

import lombok.Data;

@Data
public class ObjectifsDTO { // Ajoutez 'public' ici
    private Integer scenesCompletees;
    private Integer scenesCibles;
    private Integer dialoguesEcrits;
    private Integer dialoguesCibles;
    private Double progressionScenes; // Pourcentage
    private Double progressionDialogues; // Pourcentage
}


// CritereRechercheDTO.java
package com.example.films.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

// @Getter
// @Setter
@Data
public class CritereRechercheDTO {
    private String termeRecherche;
    private List<String> typesRecherche; // "personnages", "lieux", "plateaux", "scenes"
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Long projetId;
    private List<String> statuts;
    private String regroupement; // "plateau", "lieu", "personnage", "statut"
    private Integer page = 0;
    private Integer taille = 20;
}

    
    
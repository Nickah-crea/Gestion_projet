package com.example.films.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;


@Data
public class CritereRechercheDTO {
    private String termeRecherche;
    private List<String> typesRecherche; 
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Long projetId;
    private List<String> statuts;
    private String regroupement;
    private Integer page = 0;
    private Integer taille = 20;
}

    
    
package com.example.films.dto;

import lombok.Data;

public class RechercheEpisodeDTO {
    private Long id;
    private String titre;
    private String synopsis;
    private String projetTitre;
    private Long projetId; 
    private Integer ordre;
    
    public RechercheEpisodeDTO(Long id, String titre, String synopsis, String projetTitre, Long projetId, Integer ordre) {
        this.id = id;
        this.titre = titre;
        this.synopsis = synopsis;
        this.projetTitre = projetTitre;
        this.projetId = projetId; 
        this.ordre = ordre;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    
    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }
    
    public String getProjetTitre() { return projetTitre; }
    public void setProjetTitre(String projetTitre) { this.projetTitre = projetTitre; }
    
    public Long getProjetId() { return projetId; } 
    public void setProjetId(Long projetId) { this.projetId = projetId; } 
    
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
}


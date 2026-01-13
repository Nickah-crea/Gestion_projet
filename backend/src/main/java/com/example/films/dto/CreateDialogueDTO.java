package com.example.films.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
public class CreateDialogueDTO {
    @NotNull(message = "L'ID de la scène est obligatoire")
    private Long sceneId;
    
    private Long personnageId;
    
    @NotBlank(message = "Le texte du dialogue est obligatoire")
    private String texte;
    
    @NotNull(message = "L'ordre est obligatoire")
    @Min(value = 1, message = "L'ordre doit être au moins 1")
    private Integer ordre;
    
    private String observation;
}
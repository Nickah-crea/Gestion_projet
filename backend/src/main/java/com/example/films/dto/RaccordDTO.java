package com.example.films.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaccordDTO {
    private Long id;
    private Long sceneSourceId;
    private String sceneSourceTitre;
    private Long sceneCibleId;
    private String sceneCibleTitre;
    private Long typeRaccordId;
    private String typeRaccordNom;
    private String description;
    private Boolean estCritique;
    private Long personnageId;
    private String personnageNom;
    private Long comedienId;
    private String comedienNom;
    private Long statutRaccordId;
    private String statutRaccordNom;
    private LocalDateTime creeLe;
    private LocalDateTime modifieLe;
    private List<RaccordImageDTO> images;
    private List<VerificationRaccordDTO> verifications;
}
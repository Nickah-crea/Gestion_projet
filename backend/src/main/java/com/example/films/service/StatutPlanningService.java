package com.example.films.service;

import com.example.films.dto.StatutPlanningDTO;
import com.example.films.entity.StatutPlanning;
import com.example.films.repository.StatutPlanningRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StatutPlanningService {
    private final StatutPlanningRepository statutPlanningRepository;

    public StatutPlanningService(StatutPlanningRepository statutPlanningRepository) {
        this.statutPlanningRepository = statutPlanningRepository;
    }

    public List<StatutPlanningDTO> getAllStatuts() {
        List<StatutPlanning> statuts = statutPlanningRepository.findAllActifs();
        return statuts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public StatutPlanningDTO getStatutById(Long id) {
        StatutPlanning statut = statutPlanningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut planning non trouvé avec l'ID: " + id));
        return convertToDTO(statut);
    }

    public StatutPlanningDTO getStatutByCode(String code) {
        StatutPlanning statut = statutPlanningRepository.findByCode(code);
        if (statut == null) {
            throw new RuntimeException("Statut planning non trouvé avec le code: " + code);
        }
        return convertToDTO(statut);
    }

    public StatutPlanningDTO createStatut(StatutPlanningDTO statutPlanningDTO) {
        if (statutPlanningRepository.findByCode(statutPlanningDTO.getCode()) != null) {
            throw new RuntimeException("Un statut avec le code " + statutPlanningDTO.getCode() + " existe déjà");
        }
        
        StatutPlanning statutPlanning = convertToEntity(statutPlanningDTO);
        if (statutPlanning.getEstActif() == null) {
            statutPlanning.setEstActif(true);
        }
        
        StatutPlanning savedStatut = statutPlanningRepository.save(statutPlanning);
        return convertToDTO(savedStatut);
    }

    public StatutPlanningDTO updateStatut(Long id, StatutPlanningDTO statutPlanningDTO) {
        StatutPlanning statutPlanning = statutPlanningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut planning non trouvé avec l'ID: " + id));
        
        if (!statutPlanning.getCode().equals(statutPlanningDTO.getCode()) &&
            statutPlanningRepository.findByCode(statutPlanningDTO.getCode()) != null) {
            throw new RuntimeException("Un autre statut avec le code " + statutPlanningDTO.getCode() + " existe déjà");
        }
        
        statutPlanning.setCode(statutPlanningDTO.getCode());
        statutPlanning.setNomStatut(statutPlanningDTO.getNomStatut());
        statutPlanning.setDescription(statutPlanningDTO.getDescription());
        statutPlanning.setOrdreAffichage(statutPlanningDTO.getOrdreAffichage());
        
        StatutPlanning updatedStatut = statutPlanningRepository.save(statutPlanning);
        return convertToDTO(updatedStatut);
    }

    public void deleteStatut(Long id) {
        StatutPlanning statutPlanning = statutPlanningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut planning non trouvé avec l'ID: " + id));
        
        statutPlanning.setEstActif(false);
        statutPlanningRepository.save(statutPlanning);
    }

    public StatutPlanningDTO toggleActivation(Long id) {
        StatutPlanning statutPlanning = statutPlanningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut planning non trouvé avec l'ID: " + id));
        
        statutPlanning.setEstActif(!statutPlanning.getEstActif());
        StatutPlanning updatedStatut = statutPlanningRepository.save(statutPlanning);
        return convertToDTO(updatedStatut);
    }

    private StatutPlanningDTO convertToDTO(StatutPlanning statut) {
        StatutPlanningDTO dto = new StatutPlanningDTO();
        dto.setId(statut.getId());
        dto.setCode(statut.getCode());
        dto.setNomStatut(statut.getNomStatut());
        dto.setDescription(statut.getDescription());
        dto.setOrdreAffichage(statut.getOrdreAffichage());
        dto.setEstActif(statut.getEstActif());
        return dto;
    }

    private StatutPlanning convertToEntity(StatutPlanningDTO dto) {
        StatutPlanning statut = new StatutPlanning();
        statut.setId(dto.getId());
        statut.setCode(dto.getCode());
        statut.setNomStatut(dto.getNomStatut());
        statut.setDescription(dto.getDescription());
        statut.setOrdreAffichage(dto.getOrdreAffichage());
        statut.setEstActif(dto.getEstActif());
        return statut;
    }
}


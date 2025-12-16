package com.example.films.service;

import com.example.films.entity.StatutScene;
import com.example.films.repository.StatutSceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StatutSceneService {
    private final StatutSceneRepository statutSceneRepository;

    public StatutSceneService(StatutSceneRepository statutSceneRepository) {
        this.statutSceneRepository = statutSceneRepository;
    }

    public List<StatutScene> getAllStatuts() {
        return statutSceneRepository.findAll();
    }

    public StatutScene getStatutById(Long id) {
        return statutSceneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut scène non trouvé avec l'ID: " + id));
    }

    public StatutScene getStatutByCode(String code) {
        return statutSceneRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Statut scène non trouvé avec le code: " + code));
    }

    public StatutScene createStatut(StatutScene statutScene) {
        if (statutSceneRepository.findByCode(statutScene.getCode()).isPresent()) {
            throw new RuntimeException("Un statut avec le code " + statutScene.getCode() + " existe déjà");
        }
        
        if (statutSceneRepository.findByNomStatutsScene(statutScene.getNomStatutsScene()).isPresent()) {
            throw new RuntimeException("Un statut avec le nom " + statutScene.getNomStatutsScene() + " existe déjà");
        }
        
        if (statutScene.getEstActif() == null) {
            statutScene.setEstActif(true);
        }
        
        return statutSceneRepository.save(statutScene);
    }

    public StatutScene updateStatut(Long id, StatutScene statutSceneDetails) {
        StatutScene statutScene = getStatutById(id);
        
        if (!statutScene.getCode().equals(statutSceneDetails.getCode()) &&
            statutSceneRepository.findByCode(statutSceneDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le code " + statutSceneDetails.getCode() + " existe déjà");
        }
        
        if (!statutScene.getNomStatutsScene().equals(statutSceneDetails.getNomStatutsScene()) &&
            statutSceneRepository.findByNomStatutsScene(statutSceneDetails.getNomStatutsScene()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le nom " + statutSceneDetails.getNomStatutsScene() + " existe déjà");
        }
        
        statutScene.setCode(statutSceneDetails.getCode());
        statutScene.setNomStatutsScene(statutSceneDetails.getNomStatutsScene());
        statutScene.setDescription(statutSceneDetails.getDescription());
        statutScene.setOrdreAffichage(statutSceneDetails.getOrdreAffichage());
        
        return statutSceneRepository.save(statutScene);
    }

    public void deleteStatut(Long id) {
        StatutScene statutScene = getStatutById(id);
        statutScene.setEstActif(false);
        statutSceneRepository.save(statutScene);
    }

    public StatutScene toggleActivation(Long id) {
        StatutScene statutScene = getStatutById(id);
        statutScene.setEstActif(!statutScene.getEstActif());
        return statutSceneRepository.save(statutScene);
    }
}


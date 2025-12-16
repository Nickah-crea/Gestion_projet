package com.example.films.service;

import com.example.films.entity.StatutEpisode;
import com.example.films.repository.StatutEpisodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StatutEpisodeService {
    private final StatutEpisodeRepository statutEpisodeRepository;

    public StatutEpisodeService(StatutEpisodeRepository statutEpisodeRepository) {
        this.statutEpisodeRepository = statutEpisodeRepository;
    }

    public List<StatutEpisode> getAllStatuts() {
        return statutEpisodeRepository.findAll();
    }

    public StatutEpisode getStatutById(Long id) {
        return statutEpisodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut épisode non trouvé avec l'ID: " + id));
    }

    public StatutEpisode getStatutByCode(String code) {
        return statutEpisodeRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Statut épisode non trouvé avec le code: " + code));
    }

    public StatutEpisode createStatut(StatutEpisode statutEpisode) {
        if (statutEpisodeRepository.findByCode(statutEpisode.getCode()).isPresent()) {
            throw new RuntimeException("Un statut avec le code " + statutEpisode.getCode() + " existe déjà");
        }
        
        if (statutEpisodeRepository.findByNomStatutsEpisode(statutEpisode.getNomStatutsEpisode()).isPresent()) {
            throw new RuntimeException("Un statut avec le nom " + statutEpisode.getNomStatutsEpisode() + " existe déjà");
        }
        
        if (statutEpisode.getEstActif() == null) {
            statutEpisode.setEstActif(true);
        }
        
        return statutEpisodeRepository.save(statutEpisode);
    }

    public StatutEpisode updateStatut(Long id, StatutEpisode statutEpisodeDetails) {
        StatutEpisode statutEpisode = getStatutById(id);
        
        if (!statutEpisode.getCode().equals(statutEpisodeDetails.getCode()) &&
            statutEpisodeRepository.findByCode(statutEpisodeDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le code " + statutEpisodeDetails.getCode() + " existe déjà");
        }
        
        if (!statutEpisode.getNomStatutsEpisode().equals(statutEpisodeDetails.getNomStatutsEpisode()) &&
            statutEpisodeRepository.findByNomStatutsEpisode(statutEpisodeDetails.getNomStatutsEpisode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le nom " + statutEpisodeDetails.getNomStatutsEpisode() + " existe déjà");
        }
        
        statutEpisode.setCode(statutEpisodeDetails.getCode());
        statutEpisode.setNomStatutsEpisode(statutEpisodeDetails.getNomStatutsEpisode());
        statutEpisode.setDescription(statutEpisodeDetails.getDescription());
        statutEpisode.setOrdreAffichage(statutEpisodeDetails.getOrdreAffichage());
        
        return statutEpisodeRepository.save(statutEpisode);
    }

    public void deleteStatut(Long id) {
        StatutEpisode statutEpisode = getStatutById(id);
        statutEpisode.setEstActif(false);
        statutEpisodeRepository.save(statutEpisode);
    }

    public StatutEpisode toggleActivation(Long id) {
        StatutEpisode statutEpisode = getStatutById(id);
        statutEpisode.setEstActif(!statutEpisode.getEstActif());
        return statutEpisodeRepository.save(statutEpisode);
    }
}


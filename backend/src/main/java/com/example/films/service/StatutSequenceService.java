package com.example.films.service;

import com.example.films.entity.StatutSequence;
import com.example.films.repository.StatutSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StatutSequenceService {
    private final StatutSequenceRepository statutSequenceRepository;

    public StatutSequenceService(StatutSequenceRepository statutSequenceRepository) {
        this.statutSequenceRepository = statutSequenceRepository;
    }

    public List<StatutSequence> getAllStatuts() {
        return statutSequenceRepository.findAll();
    }

    public StatutSequence getStatutById(Long id) {
        return statutSequenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut séquence non trouvé avec l'ID: " + id));
    }

    public StatutSequence getStatutByCode(String code) {
        return statutSequenceRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Statut séquence non trouvé avec le code: " + code));
    }

    public StatutSequence createStatut(StatutSequence statutSequence) {
        if (statutSequenceRepository.findByCode(statutSequence.getCode()).isPresent()) {
            throw new RuntimeException("Un statut avec le code " + statutSequence.getCode() + " existe déjà");
        }
        
        if (statutSequenceRepository.findByNomStatutsSequence(statutSequence.getNomStatutsSequence()).isPresent()) {
            throw new RuntimeException("Un statut avec le nom " + statutSequence.getNomStatutsSequence() + " existe déjà");
        }
        
        if (statutSequence.getEstActif() == null) {
            statutSequence.setEstActif(true);
        }
        
        return statutSequenceRepository.save(statutSequence);
    }

    public StatutSequence updateStatut(Long id, StatutSequence statutSequenceDetails) {
        StatutSequence statutSequence = getStatutById(id);
        
        if (!statutSequence.getCode().equals(statutSequenceDetails.getCode()) &&
            statutSequenceRepository.findByCode(statutSequenceDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le code " + statutSequenceDetails.getCode() + " existe déjà");
        }
        
        if (!statutSequence.getNomStatutsSequence().equals(statutSequenceDetails.getNomStatutsSequence()) &&
            statutSequenceRepository.findByNomStatutsSequence(statutSequenceDetails.getNomStatutsSequence()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le nom " + statutSequenceDetails.getNomStatutsSequence() + " existe déjà");
        }
        
        statutSequence.setCode(statutSequenceDetails.getCode());
        statutSequence.setNomStatutsSequence(statutSequenceDetails.getNomStatutsSequence());
        statutSequence.setDescription(statutSequenceDetails.getDescription());
        statutSequence.setOrdreAffichage(statutSequenceDetails.getOrdreAffichage());
        
        return statutSequenceRepository.save(statutSequence);
    }

    public void deleteStatut(Long id) {
        StatutSequence statutSequence = getStatutById(id);
        statutSequence.setEstActif(false);
        statutSequenceRepository.save(statutSequence);
    }

    public StatutSequence toggleActivation(Long id) {
        StatutSequence statutSequence = getStatutById(id);
        statutSequence.setEstActif(!statutSequence.getEstActif());
        return statutSequenceRepository.save(statutSequence);
    }
}



package com.example.films.service;

import com.example.films.entity.StatutProjet;
import com.example.films.repository.StatutProjetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StatutProjetService {
    private final StatutProjetRepository statutProjetRepository;

    public StatutProjetService(StatutProjetRepository statutProjetRepository) {
        this.statutProjetRepository = statutProjetRepository;
    }

    public List<StatutProjet> getAllStatuts() {
        return statutProjetRepository.findAll();
    }

    public StatutProjet getStatutById(Long id) {
        return statutProjetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut projet non trouvé avec l'ID: " + id));
    }

    public StatutProjet getStatutByCode(String code) {
        return statutProjetRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Statut projet non trouvé avec le code: " + code));
    }

    public StatutProjet createStatut(StatutProjet statutProjet) {
        // Vérifier si le code existe déjà
        if (statutProjetRepository.findByCode(statutProjet.getCode()).isPresent()) {
            throw new RuntimeException("Un statut avec le code " + statutProjet.getCode() + " existe déjà");
        }
        
        // Vérifier si le nom existe déjà
        if (statutProjetRepository.findByNomStatutsProjet(statutProjet.getNomStatutsProjet()).isPresent()) {
            throw new RuntimeException("Un statut avec le nom " + statutProjet.getNomStatutsProjet() + " existe déjà");
        }
        
        // Par défaut, le statut est actif
        if (statutProjet.getEstActif() == null) {
            statutProjet.setEstActif(true);
        }
        
        return statutProjetRepository.save(statutProjet);
    }

    public StatutProjet updateStatut(Long id, StatutProjet statutProjetDetails) {
        StatutProjet statutProjet = getStatutById(id);
        
        // Vérifier si le nouveau code existe déjà pour un autre statut
        if (!statutProjet.getCode().equals(statutProjetDetails.getCode()) &&
            statutProjetRepository.findByCode(statutProjetDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le code " + statutProjetDetails.getCode() + " existe déjà");
        }
        
        // Vérifier si le nouveau nom existe déjà pour un autre statut
        if (!statutProjet.getNomStatutsProjet().equals(statutProjetDetails.getNomStatutsProjet()) &&
            statutProjetRepository.findByNomStatutsProjet(statutProjetDetails.getNomStatutsProjet()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le nom " + statutProjetDetails.getNomStatutsProjet() + " existe déjà");
        }
        
        // Mettre à jour les champs
        statutProjet.setCode(statutProjetDetails.getCode());
        statutProjet.setNomStatutsProjet(statutProjetDetails.getNomStatutsProjet());
        statutProjet.setDescription(statutProjetDetails.getDescription());
        statutProjet.setOrdreAffichage(statutProjetDetails.getOrdreAffichage());
        
       
        return statutProjetRepository.save(statutProjet);
    }

    public void deleteStatut(Long id) {
        StatutProjet statutProjet = getStatutById(id);
        
      
        statutProjet.setEstActif(false);
        statutProjetRepository.save(statutProjet);
    }

    public StatutProjet toggleActivation(Long id) {
        StatutProjet statutProjet = getStatutById(id);
        statutProjet.setEstActif(!statutProjet.getEstActif());
        return statutProjetRepository.save(statutProjet);
    }
}


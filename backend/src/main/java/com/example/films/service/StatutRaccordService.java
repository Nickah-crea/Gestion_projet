package com.example.films.service;

import com.example.films.entity.StatutRaccord;
import com.example.films.repository.StatutRaccordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StatutRaccordService {
    private final StatutRaccordRepository statutRaccordRepository;

    public StatutRaccordService(StatutRaccordRepository statutRaccordRepository) {
        this.statutRaccordRepository = statutRaccordRepository;
    }

    public List<StatutRaccord> getAllStatuts() {
        return statutRaccordRepository.findAll();
    }

    public StatutRaccord getStatutById(Long id) {
        return statutRaccordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut raccord non trouvé avec l'ID: " + id));
    }

    public StatutRaccord getStatutByCode(String code) {
        return statutRaccordRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Statut raccord non trouvé avec le code: " + code));
    }

    public StatutRaccord createStatut(StatutRaccord statutRaccord) {
        if (statutRaccordRepository.findByCode(statutRaccord.getCode()).isPresent()) {
            throw new RuntimeException("Un statut avec le code " + statutRaccord.getCode() + " existe déjà");
        }
        return statutRaccordRepository.save(statutRaccord);
    }

    public StatutRaccord updateStatut(Long id, StatutRaccord statutRaccordDetails) {
        StatutRaccord statutRaccord = getStatutById(id);
        
        if (!statutRaccord.getCode().equals(statutRaccordDetails.getCode()) &&
            statutRaccordRepository.findByCode(statutRaccordDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre statut avec le code " + statutRaccordDetails.getCode() + " existe déjà");
        }
        
        statutRaccord.setCode(statutRaccordDetails.getCode());
        statutRaccord.setNomStatut(statutRaccordDetails.getNomStatut());
        statutRaccord.setDescription(statutRaccordDetails.getDescription());
        
        return statutRaccordRepository.save(statutRaccord);
    }

    public void deleteStatut(Long id) {
        StatutRaccord statutRaccord = getStatutById(id);
        statutRaccordRepository.delete(statutRaccord);
    }
}


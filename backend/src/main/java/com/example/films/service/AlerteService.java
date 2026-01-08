package com.example.films.service;

import com.example.films.dto.SceneTournageDTO;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AlerteService {
    private final SceneTournageService sceneTournageService;
   

    public AlerteService(SceneTournageService sceneTournageService) {
        this.sceneTournageService = sceneTournageService;
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void verifierTournagesAConfirmer() {
        List<SceneTournageDTO> tournagesAConfirmer = sceneTournageService.getTournagesAConfirmer();
        
        if (!tournagesAConfirmer.isEmpty()) {
            envoyerAlerteTournagesAConfirmer(tournagesAConfirmer);
        }
    }

    private void envoyerAlerteTournagesAConfirmer(List<SceneTournageDTO> tournages) {
       
        System.out.println("=== ALERTE: Tournages à confirmer ===");
        tournages.forEach(tournage -> {
            System.out.println("• " + tournage.getSceneTitre() + " - " + 
                             tournage.getDateTournage() + " - " + 
                             tournage.getProjetTitre());
        });
    }
}
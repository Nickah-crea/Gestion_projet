package com.example.films.controller;

import com.example.films.dto.ScenaristeStatisticsDTO;
import com.example.films.service.ScenaristeStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/scenariste")
@RequiredArgsConstructor
public class ScenaristeStatisticsController {
    
    private final ScenaristeStatisticsService statisticsService;
    
    @GetMapping("/statistiques-personnelles")
    public ScenaristeStatisticsDTO getStatistiquesPersonnelles(@RequestParam Long userId) {
        log.info("Requête statistiques personnelles pour userId: {}", userId);
        return statisticsService.getStatisticsPersonnelles(userId);
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getStats(@RequestParam Long userId) {
        log.info("Requête stats générales pour userId: {}", userId);
        return statisticsService.getStatsGenerales(userId);
    }
    
    @GetMapping("/activites/recentes")
    public Map<String, Object> getRecentActivities(@RequestParam Long userId, 
                                                   @RequestParam(defaultValue = "5") Integer limit) {
        log.info("Requête activités récentes pour userId: {}, limit: {}", userId, limit);
        
        // Cette méthode pourrait être ajoutée au service
        return Map.of(
            "userId", userId,
            "limit", limit,
            "activities", statisticsService.getRecentActivities(userId, limit)
        );
    }
    
    @GetMapping("/projets/prioritaires")
    public Map<String, Object> getPriorityProjects(@RequestParam Long userId,
                                                   @RequestParam(defaultValue = "3") Integer limit) {
        log.info("Requête projets prioritaires pour userId: {}, limit: {}", userId, limit);
        
        // Cette méthode pourrait être ajoutée au service
        return Map.of(
            "userId", userId,
            "limit", limit,
            "projects", statisticsService.getPriorityProjects(userId, limit)
        );
    }

    @GetMapping("/scenariste/stats")
    public ResponseEntity<?> getScenaristeStatistics(
            @RequestParam(value = "userId") Long userId) {
        try {
            log.info("Requête stats scénariste reçue - userId: {}", userId);
            Map<String, Object> stats = statisticsService.getScenaristeStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur dans les stats scénariste", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur serveur", "message", e.getMessage()));
        }
    }

    @GetMapping("/stats-ecriture")
    public ResponseEntity<?> getStatsEcriture(@RequestParam Long userId) {
        log.info("Requête stats écriture détaillées pour userId: {}", userId);
        try {
            Map<String, Object> stats = statisticsService.getStatsEcritureDetaillees(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur dans les stats écriture", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur serveur", "message", e.getMessage()));
        }
    }

    @PostMapping("/enregistrer-session")
    public ResponseEntity<?> enregistrerSession(
            @RequestBody Map<String, Object> sessionData) {
        try {
            log.info("Enregistrement session: {}", sessionData);
            
            Long userId = Long.valueOf(sessionData.get("userId").toString());
            
            // Gérer les valeurs optionnelles
            Long projetId = null;
            if (sessionData.containsKey("projetId") && sessionData.get("projetId") != null) {
                projetId = Long.valueOf(sessionData.get("projetId").toString());
            }
            
            String typeContenu = (String) sessionData.get("typeContenu");
            Long contenuId = Long.valueOf(sessionData.get("contenuId").toString());
            Integer dureeMinutes = Integer.valueOf(sessionData.get("dureeMinutes").toString());
            Integer motsAjoutes = Integer.valueOf(sessionData.get("motsAjoutes").toString());
            Integer motsSupprimes = Integer.valueOf(sessionData.get("motsSupprimes").toString());
            
            // Convertir les dates
            LocalDateTime dateDebut = LocalDateTime.parse((String) sessionData.get("dateDebut"));
            LocalDateTime dateFin = LocalDateTime.parse((String) sessionData.get("dateFin"));
            
            statisticsService.enregistrerSessionEcriture(
                userId, projetId, typeContenu, contenuId, 
                dureeMinutes, motsAjoutes, motsSupprimes,
                dateDebut, dateFin
            );
            
            return ResponseEntity.ok().body(Map.of("success", true, "message", "Session enregistrée"));
            
        } catch (Exception e) {
            log.error("Erreur enregistrement session", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}



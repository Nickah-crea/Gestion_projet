package com.example.films.controller;

import com.example.films.dto.AjustementPlanningDTO;
import com.example.films.dto.RaccordDTO;
import com.example.films.entity.Raccord;
import com.example.films.repository.RaccordRepository;
import com.example.films.service.RaccordService;
import com.example.films.service.PlanningAjustementService;
import com.example.films.service.RaccordAlertService;
import com.example.films.service.SceneTournageService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/raccords")
@RequiredArgsConstructor
public class RaccordPlanningController {
    
    private final RaccordService raccordService;
    private final RaccordAlertService raccordAlerteService;
    private final SceneTournageService sceneTournageService;
    private final RaccordRepository raccordRepository;
    private final PlanningAjustementService planningAjustementService;
    
    @GetMapping("/avec-planning")
    public ResponseEntity<List<RaccordDTO>> getRaccordsAvecPlanning() {
        try {
            List<RaccordDTO> raccords = raccordService.getRaccordsAvecAlertes();
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{raccordId}/suggestions-replanification")
    public ResponseEntity<List<LocalDate>> getSuggestionsReplanification(@PathVariable Long raccordId) {
        try {
            Raccord raccord = raccordRepository.findById(raccordId)
                    .orElseThrow(() -> new RuntimeException("Raccord non trouvé"));
            
            List<LocalDate> suggestions = raccordAlerteService.getSuggestionsReplanification(raccord);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
  @PutMapping("/{raccordId}/ajuster-planning")
public ResponseEntity<?> ajusterPlanningRaccord(
        @PathVariable Long raccordId,
        @RequestBody AjustementPlanningDTO ajustement) {
    try {
        // Récupérer le raccord pour obtenir les IDs des scènes
        Raccord raccord = raccordRepository.findById(raccordId)
                .orElseThrow(() -> new RuntimeException("Raccord non trouvé"));
        
        // Déterminer quelle scène ajuster (utiliser celle spécifiée dans le DTO ou par défaut la cible)
        Long sceneIdAAjuster = ajustement.getSceneId() != null ? 
                ajustement.getSceneId() : raccord.getSceneCible().getId();
        
        // S'assurer que la scène à ajuster appartient bien au raccord
        if (!sceneIdAAjuster.equals(raccord.getSceneSource().getId()) && 
            !sceneIdAAjuster.equals(raccord.getSceneCible().getId())) {
            return ResponseEntity.badRequest().body("La scène à ajuster n'appartient pas à ce raccord");
        }
        
        ajustement.setSceneId(sceneIdAAjuster);
        
        planningAjustementService.ajusterPlanning(ajustement);
        return ResponseEntity.ok().build();
        
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur interne: " + e.getMessage());
    }
}
    
    @GetMapping("/{raccordId}/statut-planning")
    public ResponseEntity<String> getStatutPlanningRaccord(@PathVariable Long raccordId) {
        try {
            Raccord raccord = raccordRepository.findById(raccordId)
                    .orElseThrow(() -> new RuntimeException("Raccord non trouvé"));
            
            // Analyser le statut du planning pour ce raccord
            String statut = analyserStatutPlanning(raccord);
            return ResponseEntity.ok(statut);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private String analyserStatutPlanning(Raccord raccord) {
        // Implémentation de l'analyse du statut
        // Retourne "OK", "ALERTE", "CRITIQUE" etc.
        return "OK";
    }
}
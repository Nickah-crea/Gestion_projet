package com.example.films.controller;

import com.example.films.dto.*;
import com.example.films.entity.PlanningTournage;
import com.example.films.service.*;
import com.example.films.repository.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/planning-tournage")
public class PlanningTournageController {
    private final PlanningTournageService planningTournageService;
    

    public PlanningTournageController(PlanningTournageService planningTournageService) {
        this.planningTournageService = planningTournageService;
    }

    @GetMapping
    public ResponseEntity<?> getPlanningByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            // Si pas de dates fournies, utiliser le mois courant
            if (startDate == null || endDate == null) {
                LocalDate now = LocalDate.now();
                startDate = now.withDayOfMonth(1);
                endDate = now.withDayOfMonth(now.lengthOfMonth());
            }
            
            List<PlanningTournageDTO> planning = planningTournageService.getPlanningByDateRange(startDate, endDate);
            return ResponseEntity.ok(planning);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement du planning: " + e.getMessage());
        }
    }


    @GetMapping("/projet/{projetId}")
    public List<PlanningTournageDTO> getPlanningByProjetId(
            @PathVariable Long projetId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return planningTournageService.getPlanningByProjetId(projetId);
    }

    @GetMapping("/scene/{sceneId}")
    public List<PlanningTournageDTO> getPlanningBySceneId(@PathVariable Long sceneId) {
        return planningTournageService.getPlanningBySceneId(sceneId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanningTournageDTO> getPlanningById(@PathVariable Long id) {
        try {
            PlanningTournageDTO planning = planningTournageService.getPlanningById(id);
            return ResponseEntity.ok(planning);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<PlanningTournageDTO> createPlanningTournage(@RequestBody CreatePlanningTournageDTO createDTO) {
        try {
            PlanningTournageDTO createdPlanning = planningTournageService.createPlanningTournage(createDTO);
            return new ResponseEntity<>(createdPlanning, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanningTournageDTO> updatePlanningTournage(@PathVariable Long id, @RequestBody CreatePlanningTournageDTO updateDTO) {
        try {
            PlanningTournageDTO updatedPlanning = planningTournageService.updatePlanningTournage(id, updateDTO);
            return ResponseEntity.ok(updatedPlanning);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanningTournage(@PathVariable Long id) {
        try {
            planningTournageService.deletePlanningTournage(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<PlanningTournageDTO>> getAllPlanning() {
        try {
            LocalDate startDate = LocalDate.of(2000, 1, 1); 
            LocalDate endDate = LocalDate.of(2100, 12, 31); 
            List<PlanningTournageDTO> planning = planningTournageService.getPlanningByDateRange(startDate, endDate);
            return ResponseEntity.ok(planning);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    private PlanningTournageDTO convertToDTO(PlanningTournage planning) {
    PlanningTournageDTO dto = new PlanningTournageDTO();
    dto.setId(planning.getId());
    dto.setDateTournage(planning.getDateTournage());
    dto.setHeureDebut(planning.getHeureDebut());
    dto.setHeureFin(planning.getHeureFin());
    dto.setSceneId(planning.getScene().getId());
    dto.setSceneTitre(planning.getScene().getTitre());
    dto.setStatutNom(planning.getStatut().getNomStatut());
    return dto;
}
    
}


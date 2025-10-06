package com.example.films.controller;

import com.example.films.dto.CreateSceneTournageDTO;
import com.example.films.dto.SceneTournageDTO;
import com.example.films.service.SceneTournageService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/scene-tournage")
public class SceneTournageController {
    private final SceneTournageService sceneTournageService;

    public SceneTournageController(SceneTournageService sceneTournageService) {
        this.sceneTournageService = sceneTournageService;
    }

    @GetMapping("/date/{date}")
    public List<SceneTournageDTO> getTournagesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return sceneTournageService.getTournagesByDate(date);
    }

    @GetMapping("/periode")
    public ResponseEntity<?> getTournagesByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long projetId) {
        
        try {
            List<SceneTournageDTO> tournages;
            
            if (projetId != null) {
                tournages = sceneTournageService.getTournagesByProjet(projetId);
                // Filtrer par date range côté Java si nécessaire
                tournages = tournages.stream()
                    .filter(t -> !t.getDateTournage().isBefore(startDate) && !t.getDateTournage().isAfter(endDate))
                    .collect(Collectors.toList());
            } else {
                tournages = sceneTournageService.getTournagesByDateRange(startDate, endDate);
            }
            
            return ResponseEntity.ok(tournages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des tournages: " + e.getMessage());
        }
    }

    @GetMapping("/statut/{statut}")
    public List<SceneTournageDTO> getTournagesByStatut(@PathVariable String statut) {
        return sceneTournageService.getTournagesByStatut(statut);
    }

    @GetMapping("/projet/{projetId}")
    public List<SceneTournageDTO> getTournagesByProjet(@PathVariable Long projetId) {
        return sceneTournageService.getTournagesByProjet(projetId);
    }

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<SceneTournageDTO> getTournageByScene(@PathVariable Long sceneId) {
        SceneTournageDTO tournage = sceneTournageService.getTournageBySceneId(sceneId);
        return tournage != null ? ResponseEntity.ok(tournage) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SceneTournageDTO> getTournageById(@PathVariable Long id) {
        try {
            SceneTournageDTO tournage = sceneTournageService.getTournageById(id);
            return ResponseEntity.ok(tournage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<SceneTournageDTO> planifierTournage(@RequestBody CreateSceneTournageDTO createDTO) {
        try {
            SceneTournageDTO created = sceneTournageService.planifierTournage(createDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<SceneTournageDTO> modifierStatut(@PathVariable Long id, @PathVariable String statut) {
        try {
            SceneTournageDTO updated = sceneTournageService.modifierStatut(id, statut);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SceneTournageDTO> modifierTournage(@PathVariable Long id, @RequestBody CreateSceneTournageDTO updateDTO) {
        try {
            SceneTournageDTO updated = sceneTournageService.modifierTournage(id, updateDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerTournage(@PathVariable Long id) {
        try {
            sceneTournageService.supprimerTournage(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/a-confirmer")
    public List<SceneTournageDTO> getTournagesAConfirmer() {
        return sceneTournageService.getTournagesAConfirmer();
    }
}
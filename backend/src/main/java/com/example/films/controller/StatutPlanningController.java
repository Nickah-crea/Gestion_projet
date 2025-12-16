package com.example.films.controller;

import com.example.films.dto.StatutPlanningDTO;
import com.example.films.service.StatutPlanningService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-planning")
public class StatutPlanningController {
    private final StatutPlanningService statutPlanningService;

    public StatutPlanningController(StatutPlanningService statutPlanningService) {
        this.statutPlanningService = statutPlanningService;
    }

    @GetMapping
    public List<StatutPlanningDTO> getAllStatuts() {
        return statutPlanningService.getAllStatuts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutPlanningDTO> getStatutById(@PathVariable Long id) {
        StatutPlanningDTO statut = statutPlanningService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StatutPlanningDTO> getStatutByCode(@PathVariable String code) {
        StatutPlanningDTO statut = statutPlanningService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    @PostMapping
    public ResponseEntity<StatutPlanningDTO> createStatut(@RequestBody StatutPlanningDTO statutPlanningDTO) {
        StatutPlanningDTO createdStatut = statutPlanningService.createStatut(statutPlanningDTO);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutPlanningDTO> updateStatut(@PathVariable Long id, @RequestBody StatutPlanningDTO statutPlanningDTO) {
        StatutPlanningDTO updatedStatut = statutPlanningService.updateStatut(id, statutPlanningDTO);
        return ResponseEntity.ok(updatedStatut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutPlanningService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<StatutPlanningDTO> toggleActivation(@PathVariable Long id) {
        StatutPlanningDTO statut = statutPlanningService.toggleActivation(id);
        return ResponseEntity.ok(statut);
    }
}



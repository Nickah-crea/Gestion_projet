package com.example.films.controller;

import com.example.films.entity.StatutProjet;
import com.example.films.service.StatutProjetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-projet")
@CrossOrigin(origins = "http://localhost:5173")
public class StatutProjetController {
    private final StatutProjetService statutProjetService;

    public StatutProjetController(StatutProjetService statutProjetService) {
        this.statutProjetService = statutProjetService;
    }

    // GET ALL
    @GetMapping
    public List<StatutProjet> getAllStatuts() {
        return statutProjetService.getAllStatuts();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<StatutProjet> getStatutById(@PathVariable Long id) {
        StatutProjet statut = statutProjetService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    // GET BY CODE
    @GetMapping("/code/{code}")
    public ResponseEntity<StatutProjet> getStatutByCode(@PathVariable String code) {
        StatutProjet statut = statutProjetService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<StatutProjet> createStatut(@RequestBody StatutProjet statutProjet) {
        StatutProjet createdStatut = statutProjetService.createStatut(statutProjet);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<StatutProjet> updateStatut(@PathVariable Long id, @RequestBody StatutProjet statutProjet) {
        StatutProjet updatedStatut = statutProjetService.updateStatut(id, statutProjet);
        return ResponseEntity.ok(updatedStatut);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutProjetService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }

    // TOGGLE ACTIVATION
    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<StatutProjet> toggleActivation(@PathVariable Long id) {
        StatutProjet statut = statutProjetService.toggleActivation(id);
        return ResponseEntity.ok(statut);
    }
}


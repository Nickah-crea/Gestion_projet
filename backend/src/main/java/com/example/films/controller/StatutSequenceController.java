package com.example.films.controller;

import com.example.films.entity.StatutSequence;
import com.example.films.service.StatutSequenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-sequence")
public class StatutSequenceController {
    private final StatutSequenceService statutSequenceService;

    public StatutSequenceController(StatutSequenceService statutSequenceService) {
        this.statutSequenceService = statutSequenceService;
    }

    @GetMapping
    public List<StatutSequence> getAllStatuts() {
        return statutSequenceService.getAllStatuts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutSequence> getStatutById(@PathVariable Long id) {
        StatutSequence statut = statutSequenceService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StatutSequence> getStatutByCode(@PathVariable String code) {
        StatutSequence statut = statutSequenceService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    @PostMapping
    public ResponseEntity<StatutSequence> createStatut(@RequestBody StatutSequence statutSequence) {
        StatutSequence createdStatut = statutSequenceService.createStatut(statutSequence);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutSequence> updateStatut(@PathVariable Long id, @RequestBody StatutSequence statutSequence) {
        StatutSequence updatedStatut = statutSequenceService.updateStatut(id, statutSequence);
        return ResponseEntity.ok(updatedStatut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutSequenceService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<StatutSequence> toggleActivation(@PathVariable Long id) {
        StatutSequence statut = statutSequenceService.toggleActivation(id);
        return ResponseEntity.ok(statut);
    }
}


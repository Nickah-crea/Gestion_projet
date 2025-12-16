package com.example.films.controller;

import com.example.films.entity.StatutEpisode;
import com.example.films.service.StatutEpisodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-episode")
public class StatutEpisodeController {
    private final StatutEpisodeService statutEpisodeService;

    public StatutEpisodeController(StatutEpisodeService statutEpisodeService) {
        this.statutEpisodeService = statutEpisodeService;
    }

    @GetMapping
    public List<StatutEpisode> getAllStatuts() {
        return statutEpisodeService.getAllStatuts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutEpisode> getStatutById(@PathVariable Long id) {
        StatutEpisode statut = statutEpisodeService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StatutEpisode> getStatutByCode(@PathVariable String code) {
        StatutEpisode statut = statutEpisodeService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    @PostMapping
    public ResponseEntity<StatutEpisode> createStatut(@RequestBody StatutEpisode statutEpisode) {
        StatutEpisode createdStatut = statutEpisodeService.createStatut(statutEpisode);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutEpisode> updateStatut(@PathVariable Long id, @RequestBody StatutEpisode statutEpisode) {
        StatutEpisode updatedStatut = statutEpisodeService.updateStatut(id, statutEpisode);
        return ResponseEntity.ok(updatedStatut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutEpisodeService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<StatutEpisode> toggleActivation(@PathVariable Long id) {
        StatutEpisode statut = statutEpisodeService.toggleActivation(id);
        return ResponseEntity.ok(statut);
    }
}


package com.example.films.controller;

import com.example.films.entity.StatutScene;
import com.example.films.service.StatutSceneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-scene")
@CrossOrigin(origins = "http://localhost:5173")
public class StatutSceneController {
    private final StatutSceneService statutSceneService;

    public StatutSceneController(StatutSceneService statutSceneService) {
        this.statutSceneService = statutSceneService;
    }

    @GetMapping
    public List<StatutScene> getAllStatuts() {
        return statutSceneService.getAllStatuts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutScene> getStatutById(@PathVariable Long id) {
        StatutScene statut = statutSceneService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StatutScene> getStatutByCode(@PathVariable String code) {
        StatutScene statut = statutSceneService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    @PostMapping
    public ResponseEntity<StatutScene> createStatut(@RequestBody StatutScene statutScene) {
        StatutScene createdStatut = statutSceneService.createStatut(statutScene);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutScene> updateStatut(@PathVariable Long id, @RequestBody StatutScene statutScene) {
        StatutScene updatedStatut = statutSceneService.updateStatut(id, statutScene);
        return ResponseEntity.ok(updatedStatut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutSceneService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<StatutScene> toggleActivation(@PathVariable Long id) {
        StatutScene statut = statutSceneService.toggleActivation(id);
        return ResponseEntity.ok(statut);
    }
}


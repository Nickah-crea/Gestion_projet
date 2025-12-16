package com.example.films.controller;

import com.example.films.entity.StatutRaccord;
import com.example.films.service.StatutRaccordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statuts-raccord")
public class StatutRaccordController {
    private final StatutRaccordService statutRaccordService;

    public StatutRaccordController(StatutRaccordService statutRaccordService) {
        this.statutRaccordService = statutRaccordService;
    }

    @GetMapping
    public List<StatutRaccord> getAllStatuts() {
        return statutRaccordService.getAllStatuts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutRaccord> getStatutById(@PathVariable Long id) {
        StatutRaccord statut = statutRaccordService.getStatutById(id);
        return ResponseEntity.ok(statut);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StatutRaccord> getStatutByCode(@PathVariable String code) {
        StatutRaccord statut = statutRaccordService.getStatutByCode(code);
        return ResponseEntity.ok(statut);
    }

    @PostMapping
    public ResponseEntity<StatutRaccord> createStatut(@RequestBody StatutRaccord statutRaccord) {
        StatutRaccord createdStatut = statutRaccordService.createStatut(statutRaccord);
        return new ResponseEntity<>(createdStatut, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutRaccord> updateStatut(@PathVariable Long id, @RequestBody StatutRaccord statutRaccord) {
        StatutRaccord updatedStatut = statutRaccordService.updateStatut(id, statutRaccord);
        return ResponseEntity.ok(updatedStatut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatut(@PathVariable Long id) {
        statutRaccordService.deleteStatut(id);
        return ResponseEntity.noContent().build();
    }
}


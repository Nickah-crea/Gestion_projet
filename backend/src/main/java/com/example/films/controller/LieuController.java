package com.example.films.controller;

import com.example.films.dto.CreateLieuDTO;
import com.example.films.dto.LieuDTO;
import com.example.films.service.LieuService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lieux")
public class LieuController {
    private final LieuService lieuService;

    public LieuController(LieuService lieuService) {
        this.lieuService = lieuService;
    }

    @GetMapping("/projets/{projetId}")
    public List<LieuDTO> getLieuxByProjetId(@PathVariable Long projetId) {
        return lieuService.getLieuxByProjetId(projetId);
    }

    @GetMapping
    public ResponseEntity<List<LieuDTO>> getAllLieux() {
        try {
            List<LieuDTO> lieux = lieuService.getAllLieux();
            return ResponseEntity.ok(lieux);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LieuDTO> getLieuById(@PathVariable Long id) {
        try {
            LieuDTO lieu = lieuService.getLieuById(id);
            return ResponseEntity.ok(lieu);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<LieuDTO> createLieu(@RequestBody CreateLieuDTO createLieuDTO) {
        try {
            LieuDTO createdLieu = lieuService.createLieu(createLieuDTO);
            return new ResponseEntity<>(createdLieu, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LieuDTO> updateLieu(@PathVariable Long id, @RequestBody CreateLieuDTO updateLieuDTO) {
        try {
            LieuDTO updatedLieu = lieuService.updateLieu(id, updateLieuDTO);
            return ResponseEntity.ok(updatedLieu);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLieu(@PathVariable Long id) {
        try {
            lieuService.deleteLieu(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
}
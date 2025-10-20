// RechercheAvanceeController.java - MODIFICATIONS
package com.example.films.controller;

import com.example.films.dto.RechercheAvanceeDTO;
import com.example.films.dto.CritereRechercheDTO;
import com.example.films.service.RechercheAvanceeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/recherche-avancee")
@CrossOrigin(origins = "http://localhost:5173")
public class RechercheAvanceeController {
    
    private final RechercheAvanceeService rechercheAvanceeService;
    
    public RechercheAvanceeController(RechercheAvanceeService rechercheAvanceeService) {
        this.rechercheAvanceeService = rechercheAvanceeService;
    }
    
    // ENDPOINT EXISTANT - Recherche avancée
    @PostMapping
    public ResponseEntity<List<RechercheAvanceeDTO>> rechercherAvance(@RequestBody CritereRechercheDTO criteres) {
        try {
            List<RechercheAvanceeDTO> resultats = rechercheAvanceeService.rechercherAvance(criteres);
            return ResponseEntity.ok(resultats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ENDPOINT EXISTANT - Statuts disponibles
    @GetMapping("/statuts")
    public ResponseEntity<List<String>> getStatutsDisponibles() {
        try {
            List<String> statuts = List.of("planifie", "confirme", "en_cours", "termine", "reporte");
            return ResponseEntity.ok(statuts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ENDPOINT EXISTANT - Détails simples
    @GetMapping("/details/{type}/{id}")
    public ResponseEntity<RechercheAvanceeDTO> getDetailsResultat(
            @PathVariable String type, 
            @PathVariable Long id) {
        try {
            RechercheAvanceeDTO details = rechercheAvanceeService.getDetailsParTypeEtId(type, id);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // NOUVEL ENDPOINT - Détails complets selon le type
    @GetMapping("/details/{type}/{id}/complets")
    public ResponseEntity<Map<String, Object>> getDetailsComplets(
            @PathVariable String type, 
            @PathVariable Long id) {
        try {
            Map<String, Object> detailsComplets = rechercheAvanceeService.getDetailsCompletsParTypeEtId(type, id);
            return ResponseEntity.ok(detailsComplets);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // NOUVEL ENDPOINT - Statistiques par type
    @GetMapping("/statistiques/{type}/{id}")
    public ResponseEntity<Map<String, Object>> getStatistiques(
            @PathVariable String type,
            @PathVariable Long id) {
        try {
            Map<String, Object> statistiques = rechercheAvanceeService.getStatistiquesParTypeEtId(type, id);
            return ResponseEntity.ok(statistiques);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}


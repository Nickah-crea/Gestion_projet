// RechercheGlobaleController.java
package com.example.films.controller;

import com.example.films.dto.RechercheGlobaleDTO;
import com.example.films.service.RechercheGlobaleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recherche-globale")
@CrossOrigin(origins = "http://localhost:5173")
public class RechercheGlobaleController {
    
    private final RechercheGlobaleService rechercheGlobaleService;
    
    public RechercheGlobaleController(RechercheGlobaleService rechercheGlobaleService) {
        this.rechercheGlobaleService = rechercheGlobaleService;
    }
    
    @GetMapping
    public List<RechercheGlobaleDTO> rechercherGlobalement(
            @RequestParam String q,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String date) {
        
        return rechercheGlobaleService.rechercherGlobalement(q, statut, date);
    }
}


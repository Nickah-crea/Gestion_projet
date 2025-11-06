package com.example.films.controller;

import com.example.films.dto.*;
import com.example.films.entity.VerificationRaccord;
import com.example.films.service.RaccordVerificationService;
import com.example.films.service.RaccordService;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/raccords")
@CrossOrigin(origins = "*")
public class RaccordVerificationController {
    
    private final RaccordVerificationService verificationService;
    private final RaccordService raccordService;
   
    public RaccordVerificationController(RaccordVerificationService verificationService,
                                       RaccordService raccordService
                                    ) {
        this.verificationService = verificationService;
        this.raccordService = raccordService;
    
    }
    
    @GetMapping("/verifications")
    public ResponseEntity<List<VerificationRaccordDTO>> getVerifications(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long typeRaccordId,
            @RequestParam(required = false) Boolean critique,
            @RequestParam(required = false) String periode) {
        
        try {
            List<VerificationRaccordDTO> verifications = verificationService
                    .getVerificationsFiltrees(statut, typeRaccordId, critique, periode);
            return ResponseEntity.ok(verifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/verifications/{id}/details")
    public ResponseEntity<DetailVerificationDTO> getDetailsVerification(@PathVariable Long id) {
        try {
            DetailVerificationDTO details = verificationService.getDetailsVerification(id);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/verifications/statistiques")
    public ResponseEntity<StatistiquesVerificationDTO> getStatistiques() {
        try {
            StatistiquesVerificationDTO stats = verificationService.getStatistiques();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/verifications/rapport")
    public ResponseEntity<Resource> exporterRapport(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long typeRaccordId,
            @RequestParam(required = false) Boolean critique,
            @RequestParam(required = false) String periode) {
        
        try {
            byte[] rapport = verificationService.genererRapportVerifications(
                    statut, typeRaccordId, critique, periode);
            
            ByteArrayResource resource = new ByteArrayResource(rapport);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=rapport-verifications-" + 
                            LocalDate.now() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(rapport.length)
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/verifications/{id}/preuves/zip")
    public ResponseEntity<Resource> telechargerPreuves(@PathVariable Long id) {
        try {
            byte[] zipData = verificationService.creerArchivePreuves(id);
            ByteArrayResource resource = new ByteArrayResource(zipData);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=preuves-verification-" + id + ".zip")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(zipData.length)
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/verifications/{id}/statut")
    public ResponseEntity<Void> mettreAJourStatut(
            @PathVariable Long id,
            @RequestBody MiseAJourStatutDTO miseAJour) {
        
        try {
            verificationService.mettreAJourStatut(id, miseAJour.getStatut(), miseAJour.getNotes());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // @GetMapping("/verifications/types")
    // public ResponseEntity<List<TypeRaccordDTO>> getTypesRaccord() {
    //     try {
    //         List<TypeRaccordDTO> types = raccordService.getAllTypesRaccordDTO();
    //         return ResponseEntity.ok(types);
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //     }
    // }
    
    // DTOs
    @Data
    public static class MiseAJourStatutDTO {
        private String statut;
        private String notes;
    }

}
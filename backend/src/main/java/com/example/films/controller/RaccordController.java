package com.example.films.controller;

import com.example.films.dto.*;
import com.example.films.service.RaccordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.example.films.entity.TypeRaccord; 
import com.example.films.entity.StatutRaccord; 
import com.example.films.entity.StatutVerification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/raccords")
public class RaccordController {
    
    private final RaccordService raccordService;
    
    public RaccordController(RaccordService raccordService) {
        this.raccordService = raccordService;
    }
    
    @GetMapping
    public ResponseEntity<List<RaccordDTO>> getAllRaccords() {
        try {
            List<RaccordDTO> raccords = raccordService.getAllRaccords();
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<List<RaccordDTO>> getRaccordsByScene(@PathVariable Long sceneId) {
        try {
            List<RaccordDTO> raccords = raccordService.getRaccordsByScene(sceneId);
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RaccordDTO> getRaccordById(@PathVariable Long id) {
        try {
            RaccordDTO raccord = raccordService.getRaccordById(id);
            return ResponseEntity.ok(raccord);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

     @GetMapping("/personnage/{personnageId}")
    public ResponseEntity<List<RaccordDTO>> getRaccordsByPersonnage(@PathVariable Long personnageId) {
        try {
            List<RaccordDTO> raccords = raccordService.getRaccordsByPersonnage(personnageId);
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/comedien/{comedienId}")
    public ResponseEntity<List<RaccordDTO>> getRaccordsByComedien(@PathVariable Long comedienId) {
        try {
            List<RaccordDTO> raccords = raccordService.getRaccordsByComedien(comedienId);
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

     @GetMapping("/sans-personnage")
    public ResponseEntity<List<RaccordDTO>> getRaccordsSansPersonnage() {
        try {
            List<RaccordDTO> raccords = raccordService.getRaccordsSansPersonnage();
            return ResponseEntity.ok(raccords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createRaccord(
            @RequestParam("sceneSourceId") Long sceneSourceId,
            @RequestParam("sceneCibleId") Long sceneCibleId,
            @RequestParam("typeRaccordId") Long typeRaccordId,
            @RequestParam("description") String description,
            @RequestParam(value = "estCritique", defaultValue = "false") Boolean estCritique,
            @RequestParam(value = "statutRaccordId", defaultValue = "1") Long statutRaccordId,
            @RequestParam(value = "personnageId", required = false) Long personnageId,
            @RequestParam(value = "comedienId", required = false) Long comedienId,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        try {
            CreateRaccordDTO createRaccordDTO = new CreateRaccordDTO();
            createRaccordDTO.setSceneSourceId(sceneSourceId);
            createRaccordDTO.setSceneCibleId(sceneCibleId);
            createRaccordDTO.setTypeRaccordId(typeRaccordId);
            createRaccordDTO.setDescription(description);
            createRaccordDTO.setEstCritique(estCritique);
            createRaccordDTO.setStatutRaccordId(statutRaccordId);
            createRaccordDTO.setPersonnageId(personnageId);
            createRaccordDTO.setComedienId(comedienId);
            
            if (images != null && images.length > 0) {
                createRaccordDTO.setImages(Arrays.asList(images));
            }
            
            RaccordDTO createdRaccord = raccordService.createRaccord(createRaccordDTO);
            return new ResponseEntity<>(createdRaccord, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur interne du serveur");
        }
    }
 
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RaccordDTO> updateRaccord(
            @PathVariable Long id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "estCritique", required = false) Boolean estCritique,
            @RequestParam(value = "statutRaccordId", required = false) Long statutRaccordId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            CreateRaccordDTO updateRaccordDTO = new CreateRaccordDTO();
            updateRaccordDTO.setDescription(description);
            updateRaccordDTO.setEstCritique(estCritique);
            updateRaccordDTO.setStatutRaccordId(statutRaccordId);
            updateRaccordDTO.setImages(images);
            
            RaccordDTO updatedRaccord = raccordService.updateRaccord(id, updateRaccordDTO);
            return ResponseEntity.ok(updatedRaccord);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRaccord(@PathVariable Long id) {
        try {
            raccordService.deleteRaccord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> addImagesToRaccord(
            @PathVariable Long id,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "description", defaultValue = "") String description) {
        
        try {
            raccordService.addImagesToRaccord(id, images, description);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        try {
            raccordService.deleteImage(imageId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping(value = "/{id}/verification", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VerificationRaccordDTO> verifierRaccord(
            @PathVariable Long id,
            @RequestParam("utilisateurId") Long utilisateurId,
            @RequestParam("statutVerificationId") Long statutVerificationId,
            @RequestParam(value = "notes", defaultValue = "") String notes,
            @RequestParam(value = "preuveImage", required = false) MultipartFile preuveImage) {
        
        try {
            VerificationRaccordDTO verification = raccordService.verifierRaccord(
                    id, utilisateurId, statutVerificationId, notes, preuveImage);
            return ResponseEntity.ok(verification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/image/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            byte[] image = raccordService.getImage(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(image);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/types")
    public ResponseEntity<List<TypeRaccord>> getAllTypesRaccord() {
        try {
            List<TypeRaccord> types = raccordService.getAllTypesRaccord();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/statuts")
    public ResponseEntity<List<StatutRaccord>> getAllStatutsRaccord() {
        try {
            List<StatutRaccord> statuts = raccordService.getAllStatutsRaccord();
            return ResponseEntity.ok(statuts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/statuts-verification")
    public ResponseEntity<List<StatutVerification>> getAllStatutsVerification() {
        try {
            List<StatutVerification> statuts = raccordService.getAllStatutsVerification();
            return ResponseEntity.ok(statuts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
}
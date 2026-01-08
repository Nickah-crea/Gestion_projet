package com.example.films.controller;

import com.example.films.dto.ProfilUtilisateurDTO;
import com.example.films.dto.UpdateProfilRequest;
import com.example.films.dto.PhotoProfileResponse;
import com.example.films.service.ProfilService;
import com.example.films.exception.ResourceNotFoundException;
import com.example.films.exception.DuplicateResourceException;
import com.example.films.exception.BusinessValidationException;
import com.example.films.exception.FileStorageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/profil")
public class ProfilController {
    
    private final ProfilService profilService;
    
    public ProfilController(ProfilService profilService) {
        this.profilService = profilService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfilUtilisateur(@PathVariable Long id) {
        try {
            ProfilUtilisateurDTO profil = profilService.getProfilUtilisateur(id);
            return ResponseEntity.ok(profil);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de la récupération du profil"));
        }
    }
    
    
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProfil(@PathVariable Long id, 
                                          @RequestBody UpdateProfilRequest request) {
        try {
           
            if (request.getNom() != null && request.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(creerReponseErreur("Le nom ne peut pas être vide"));
            }
            
            if (request.getEmail() != null && request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(creerReponseErreur("L'email ne peut pas être vide"));
            }
            
            if (request.getNewPassword() != null && request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(creerReponseErreur("Le nouveau mot de passe doit contenir au moins 6 caractères"));
            }
            
            ProfilUtilisateurDTO profilMisAJour = profilService.updateProfil(id, request);
            return ResponseEntity.ok(profilMisAJour);
            
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (BusinessValidationException e) {
            return ResponseEntity.badRequest()
                    .body(creerReponseErreur(e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de la mise à jour du profil"));
        }
    }
    
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long id,
                                                @RequestParam("photo") MultipartFile file) {
        try {
            PhotoProfileResponse response = profilService.uploadProfilePhoto(id, file);
            return ResponseEntity.ok(response);
        } catch (BusinessValidationException e) {
            return ResponseEntity.badRequest()
                    .body(creerReponseErreur(e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de l'upload de la photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur interne du serveur"));
        }
    }
    
   
    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> deleteProfilePhoto(@PathVariable Long id) {
        try {
            profilService.deleteProfilePhoto(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Photo de profil supprimée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de la suppression de la photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur interne du serveur"));
        }
    }
    
    @GetMapping("/photo/{filename}")
    public ResponseEntity<?> getProfilePhoto(@PathVariable String filename) {
        try {
            byte[] photo = profilService.getProfilePhoto(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(photo);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur("Photo non trouvée"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de la lecture de la photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur interne du serveur"));
        }
    }
    
    @PutMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfilePhoto(@PathVariable Long id,
                                                @RequestParam("photo") MultipartFile file) {
        try {
            PhotoProfileResponse response = profilService.updateProfilePhoto(id, file);
            return ResponseEntity.ok(response);
        } catch (BusinessValidationException e) {
            return ResponseEntity.badRequest()
                    .body(creerReponseErreur(e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(creerReponseErreur(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur lors de la mise à jour de la photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(creerReponseErreur("Erreur interne du serveur"));
        }
    }
    
    private Map<String, Object> creerReponseErreur(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}


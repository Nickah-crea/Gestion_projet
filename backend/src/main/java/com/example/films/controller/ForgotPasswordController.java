package com.example.films.controller;

import com.example.films.dto.ForgotPasswordResponse;
import com.example.films.dto.PasswordResetRequest;
import com.example.films.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class ForgotPasswordController {
    
    private final PasswordResetService passwordResetService;
    
    public ForgotPasswordController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    
    /**
     * Étape 1: Demande de réinitialisation
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "L'adresse email est requise.", null)
            );
        }
        
        ForgotPasswordResponse response = passwordResetService.initiatePasswordReset(email);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Étape 2: Vérification du code
     */
    @PostMapping("/verify-reset-code")
    public ResponseEntity<ForgotPasswordResponse> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "L'adresse email est requise.", null)
            );
        }
        
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "Le code de vérification est requis.", null)
            );
        }
        
        ForgotPasswordResponse response = passwordResetService.verifyCode(email, code);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Étape 3: Réinitialisation du mot de passe
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ForgotPasswordResponse> resetPassword(@RequestBody PasswordResetRequest request) {
        // Validation
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "L'adresse email est requise.", null)
            );
        }
        
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "Le code de vérification est requis.", null)
            );
        }
        
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "Le nouveau mot de passe est requis.", request.getEmail())
            );
        }
        
        if (request.getConfirmPassword() == null || request.getConfirmPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ForgotPasswordResponse(false, "La confirmation du mot de passe est requise.", request.getEmail())
            );
        }
        
        ForgotPasswordResponse response = passwordResetService.resetPassword(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Endpoint de test/santé
     */
    @GetMapping("/password-reset-status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "operational");
        response.put("service", "password-reset");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}



package com.example.films.controller;

import com.example.films.dto.EmailRequest;
import com.example.films.service.EmailService;
import com.example.films.service.RechercheAvanceeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/export") 
public class ExportPdfController {

    private final EmailService emailService;
    private final RechercheAvanceeService rechercheAvanceeService;

    public ExportPdfController(EmailService emailService, RechercheAvanceeService rechercheAvanceeService) {
        this.emailService = emailService;
        this.rechercheAvanceeService = rechercheAvanceeService;
    }

    @PostMapping("/send-pdf-email")
    public ResponseEntity<?> sendPdfByEmail(@RequestBody EmailRequest emailRequest) {
        System.out.println("=== REQUÊTE REÇUE DANS sendPdfByEmail ===");
        System.out.println("Email: " + emailRequest.getToEmail());
        System.out.println("Sujet: " + emailRequest.getSubject());
        
        try {
            emailService.sendEmailWithAttachment(emailRequest);
            System.out.println("✅ Email envoyé avec succès");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PDF envoyé par email avec succès à " + emailRequest.getToEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de l'envoi: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de l'envoi de l'email: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Méthode OPTIONS pour CORS preflight
    @RequestMapping(value = "/send-pdf-email", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
}
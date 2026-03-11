package com.example.films.service;

import com.example.films.dto.ForgotPasswordResponse;
import com.example.films.dto.PasswordResetRequest;
import com.example.films.entity.PasswordResetToken;
import com.example.films.entity.Utilisateur;
import com.example.films.repository.PasswordResetTokenRepository;
import com.example.films.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {
    
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.reset-password.expiry-minutes:15}")
    private int expiryMinutes;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    public PasswordResetService(UtilisateurRepository utilisateurRepository,
                               PasswordResetTokenRepository tokenRepository,
                               JavaMailSender mailSender,
                               PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Étape 1: Demande de réinitialisation - Envoi du code par email
     */
    @Transactional
    public ForgotPasswordResponse initiatePasswordReset(String email) {
        // Vérifier si l'utilisateur existe
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
        if (utilisateurOpt.isEmpty()) {
            // Pour des raisons de sécurité, on ne révèle pas si l'email existe
            return new ForgotPasswordResponse(true, 
                "Si un compte existe avec cet email, un code de vérification a été envoyé.",
                email);
        }
        
        // Générer un code à 6 chiffres
        String code = generateVerificationCode();
        
        // Invalider les tokens existants pour cet email
        tokenRepository.invalidateAllTokensForEmail(email);
        
        // Créer et sauvegarder le nouveau token
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(expiryMinutes));
        token.setUsed(false);
        
        tokenRepository.save(token);
        
        // Envoyer l'email
        sendVerificationEmail(email, code);
        
        return new ForgotPasswordResponse(true, 
            "Un code de vérification a été envoyé à votre adresse email.", 
            email);
    }
    
    /**
     * Étape 2: Vérification du code - NE PAS marquer comme utilisé ici
     */
    @Transactional
    public ForgotPasswordResponse verifyCode(String email, String code) {
        // Vérifier le token
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndCode(email, code);
        
        if (tokenOpt.isEmpty()) {
            return new ForgotPasswordResponse(false, 
                "Code invalide ou expiré. Veuillez réessayer.", 
                email);
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        if (!token.isValid()) {
            return new ForgotPasswordResponse(false, 
                "Code expiré. Veuillez demander un nouveau code.", 
                email);
        }
        
        // NE PAS marquer comme utilisé ici - seulement après réinitialisation
        // Le token reste valide pour l'étape 3
        
        return new ForgotPasswordResponse(true, 
            "Code vérifié avec succès. Vous pouvez maintenant définir votre nouveau mot de passe.", 
            email);
    }

    
    /**
     * Étape 3: Réinitialisation du mot de passe
     */
    @Transactional
    public ForgotPasswordResponse resetPassword(PasswordResetRequest request) {
        // Validation des mots de passe
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new ForgotPasswordResponse(false, 
                "Les mots de passe ne correspondent pas.", 
                request.getEmail());
        }
        
        if (request.getNewPassword().length() < 6) {
            return new ForgotPasswordResponse(false, 
                "Le mot de passe doit contenir au moins 6 caractères.", 
                request.getEmail());
        }
        
        // Vérifier que le code a été validé ET est toujours valide
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndCode(
            request.getEmail(), request.getCode());
        
        if (tokenOpt.isEmpty()) {
            return new ForgotPasswordResponse(false, 
                "Code de vérification invalide.", 
                request.getEmail());
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        // Vérifier si le token est encore valide
        if (!token.isValid()) {
            return new ForgotPasswordResponse(false, 
                "Session expirée. Veuillez recommencer le processus.", 
                request.getEmail());
        }
        
        // Trouver l'utilisateur
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(request.getEmail());
        if (utilisateurOpt.isEmpty()) {
            return new ForgotPasswordResponse(false, 
                "Utilisateur non trouvé.", 
                request.getEmail());
        }
        
        // Mettre à jour le mot de passe
        Utilisateur utilisateur = utilisateurOpt.get();
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(utilisateur);
        
        // Maintenant, marquer le token comme utilisé
        token.setUsed(true);
        tokenRepository.save(token);
        
        // Marquer tous les autres tokens pour cet email comme utilisés (nettoyage)
        tokenRepository.invalidateAllTokensForEmail(request.getEmail());
        
        return new ForgotPasswordResponse(true, 
            "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.", 
            request.getEmail());
    }
    
    /**
     * Génère un code à 6 chiffres
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
    
    /**
     * Envoie l'email avec le code de vérification en HTML (centré et en gras)
     */
    private void sendVerificationEmail(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(email);
            helper.setSubject("Réinitialisation de votre mot de passe - VDFI Prod");
            
            // Email en HTML avec code centré et en gras
            String htmlContent = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }" +
                "        .container { padding: 20px; }" +
                "        .header { background-color: #731613; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }" +
                "        .content { background-color: #fffcfc; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }" +
                "        .code-container { margin: 30px 0; text-align: center; }" +
                "        .verification-code { " +
                "            font-size: 36px; " +
                "            font-weight: bold; " +
                "            letter-spacing: 10px; " +
                "            color: #731613; " +
                "            background-color: #f5f5f5; " +
                "            padding: 20px; " +
                "            border-radius: 10px; " +
                "            display: inline-block; " +
                "            border: 2px dashed #731613; " +
                "        }" +
                "        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }" +
                "        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h2>Réinitialisation de mot de passe</h2>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p>Bonjour,</p>" +
                "            <p>Vous avez demandé à réinitialiser votre mot de passe sur <strong>VDFI Prod</strong>.</p>" +
                "            <div class='code-container'>" +
                "                <p>Votre code de vérification est :</p>" +
                "                <div class='verification-code'>%s</div>" +
                "                <p style='margin-top: 15px;'>Ce code est valable pendant <strong>%d minutes</strong>.</p>" +
                "            </div>" +
                "            <div class='warning'>" +
                "                <p><strong>⚠ Important :</strong> Ne partagez jamais ce code avec qui que ce soit.</p>" +
                "            </div>" +
                "            <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>" +
                "            <p>Cordialement,<br>L'équipe de <strong>VDFI Prod</strong></p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>",
                code, expiryMinutes
            );
            
            helper.setText(htmlContent, true); // true pour HTML
            
            mailSender.send(message);
            
            System.out.println("📧 Email HTML envoyé à " + email + " avec le code: " + code);
            
        } catch (MessagingException e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email HTML: " + e.getMessage());
            // En cas d'erreur HTML, essayer avec un email texte simple
            sendSimpleVerificationEmail(email, code);
        }
    }
    
    /**
     * Méthode de secours pour envoyer un email texte simple
     */
    private void sendSimpleVerificationEmail(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            
            helper.setTo(email);
            helper.setSubject("Réinitialisation de votre mot de passe - VDFI Prod");
            
            String textContent = String.format(
                "Bonjour,\n\n" +
                "Vous avez demandé à réinitialiser votre mot de passe.\n\n" +
                "Votre code de vérification est : %s\n\n" +
                "Ce code est valable pendant %d minutes.\n\n" +
                "Si vous n'avez pas fait cette demande, veuillez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe de VDFI Prod",
                code, expiryMinutes
            );
            
            helper.setText(textContent);
            mailSender.send(message);
            
            System.out.println("📧 Email texte envoyé à " + email);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email texte: " + e.getMessage());
        }
    }
    
    /**
     * Nettoyage des tokens expirés (à appeler périodiquement)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}


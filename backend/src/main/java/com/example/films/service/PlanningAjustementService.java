package com.example.films.service;

import com.example.films.dto.AjustementPlanningDTO;
import com.example.films.entity.PlanningTournage;
import com.example.films.entity.SceneTournage;
import com.example.films.repository.PlanningTournageRepository;
import com.example.films.repository.SceneTournageRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanningAjustementService {
    
    private final PlanningTournageRepository planningTournageRepository;
    private final ConflictDetectionService conflictDetectionService;
   private final SceneTournageRepository sceneTournageRepository;
    
@Transactional
public void ajusterPlanning(AjustementPlanningDTO ajustement) {
    // Validation des données obligatoires
    if (ajustement.getSceneId() == null) {
        throw new RuntimeException("ID de scène manquant");
    }
    if (ajustement.getNouvelleDate() == null) {
        throw new RuntimeException("Nouvelle date manquante");
    }
    if (ajustement.getNouvelleHeureDebut() == null || ajustement.getNouvelleHeureFin() == null) {
        throw new RuntimeException("Heures de début ou fin manquantes");
    }
    
    // Vérifier d'abord les conflits potentiels
    boolean conflits = conflictDetectionService.detecterConflits(
        ajustement.getSceneId(),
        ajustement.getNouvelleDate(),
        ajustement.getNouvelleHeureDebut(),
        ajustement.getNouvelleHeureFin()
    );
    
    if (conflits) {
        throw new RuntimeException("Conflits détectés lors de l'ajustement du planning");
    }
    
    // Rechercher le tournage existant pour cette scène
    Optional<SceneTournage> tournageExistant = sceneTournageRepository.findBySceneId(ajustement.getSceneId());
    
    if (tournageExistant.isPresent()) {
        // Mettre à jour le tournage existant
        SceneTournage tournage = tournageExistant.get();
        tournage.setDateTournage(ajustement.getNouvelleDate());
        
        // CORRECTION : Convertir String en LocalTime
        tournage.setHeureDebut(convertirEnLocalTime(ajustement.getNouvelleHeureDebut()));
        tournage.setHeureFin(convertirEnLocalTime(ajustement.getNouvelleHeureFin()));
        
        // Ajouter les notes si fournies
        if (ajustement.getNotesSupplementaires() != null) {
            String notesActuelles = tournage.getNotes() != null ? tournage.getNotes() + "\n" : "";
            tournage.setNotes(notesActuelles + "Ajustement: " + ajustement.getNotesSupplementaires());
        }
        
        sceneTournageRepository.save(tournage);
    } else {
        throw new RuntimeException("Aucun planning existant trouvé pour cette scène. Veuillez créer un planning d'abord.");
    }
    
    // Notifier l'équipe si demandé
    if (Boolean.TRUE.equals(ajustement.getNotifierEquipe())) {
        notifierEquipe(ajustement);
    }
}

// Méthode utilitaire pour convertir String en LocalTime
private LocalTime convertirEnLocalTime(String heureString) {
    if (heureString == null || heureString.isEmpty()) {
        throw new RuntimeException("Heure invalide");
    }
    
    try {
        // Gérer différents formats
        if (heureString.length() == 5) { // Format "HH:mm"
            return LocalTime.parse(heureString);
        } else if (heureString.length() >= 8) { // Format "HH:mm:ss"
            return LocalTime.parse(heureString.substring(0, 5));
        } else {
            throw new RuntimeException("Format d'heure non supporté: " + heureString);
        }
    } catch (Exception e) {
        throw new RuntimeException("Erreur de conversion de l'heure: " + heureString, e);
    }
}

    private void notifierEquipe(AjustementPlanningDTO ajustement) {
        // Implémenter la logique de notification
        // Email, notification dans l'application, etc.
        System.out.println("Notification envoyée pour l'ajustement du planning de la scène: " + ajustement.getSceneId());
    }
}
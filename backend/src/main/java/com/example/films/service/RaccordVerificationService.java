package com.example.films.service;

import com.example.films.dto.*;
import com.example.films.entity.*;
import com.example.films.repository.*;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
public class RaccordVerificationService {
    
    private final VerificationRaccordRepository verificationRepository;
    private final RaccordRepository raccordRepository;
    private final RaccordImageRepository preuveRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final StatutVerificationRepository statutVerificationRepository;

    public RaccordVerificationService(VerificationRaccordRepository verificationRepository,
                                    RaccordRepository raccordRepository,
                                    RaccordImageRepository preuveRepository,
                                    UtilisateurRepository utilisateurRepository,
                                    StatutVerificationRepository statutVerificationRepository) {
        this.verificationRepository = verificationRepository;
        this.raccordRepository = raccordRepository;
        this.preuveRepository = preuveRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.statutVerificationRepository = statutVerificationRepository;
    }
    
    public List<VerificationRaccordDTO> getVerificationsFiltrees(
        String statut, Long typeRaccordId, Boolean critique, String periode) {
    
    try {
        System.out.println("=== DEBUT getVerificationsFiltrees ===");
        
        List<VerificationRaccord> verifications = verificationRepository.findAllWithDetails();
        System.out.println("Nombre de vérifications chargées: " + verifications.size());
        
        if (verifications.isEmpty()) {
            System.out.println("Aucune vérification trouvée dans la base de données");
            return new ArrayList<>();
        }
        
        // Appliquer les filtres progressivement pour debug
        List<VerificationRaccord> filtered = verifications;
        
        if (statut != null && !statut.isEmpty()) {
            filtered = filtered.stream()
                .filter(v -> {
                    String code = getStatutVerificationCode(v);
                    boolean match = code.equals(statut);
                    System.out.println("Filtre statut - Code: " + code + ", Recherché: " + statut + ", Match: " + match);
                    return match;
                })
                .collect(Collectors.toList());
            System.out.println("Après filtre statut: " + filtered.size());
        }
        
        if (typeRaccordId != null) {
            filtered = filtered.stream()
                .filter(v -> {
                    boolean match = v.getRaccord() != null && 
                                  v.getRaccord().getTypeRaccord() != null &&
                                  v.getRaccord().getTypeRaccord().getId().equals(typeRaccordId);
                    System.out.println("Filtre typeRaccord - Match: " + match);
                    return match;
                })
                .collect(Collectors.toList());
            System.out.println("Après filtre type: " + filtered.size());
        }
        
        if (critique != null) {
            filtered = filtered.stream()
                .filter(v -> {
                    boolean match = v.getRaccord() != null && 
                                  v.getRaccord().getEstCritique().equals(critique);
                    System.out.println("Filtre critique - Match: " + match);
                    return match;
                })
                .collect(Collectors.toList());
            System.out.println("Après filtre critique: " + filtered.size());
        }
        
        if (periode != null && !periode.equals("all")) {
            try {
                long days = Long.parseLong(periode);
                LocalDate dateLimite = LocalDate.now().minusDays(days);
                filtered = filtered.stream()
                    .filter(v -> {
                        boolean match = v.getDateVerification() != null &&
                                      (v.getDateVerification().toLocalDate().isAfter(dateLimite) ||
                                       v.getDateVerification().toLocalDate().isEqual(dateLimite));
                        System.out.println("Filtre période - Date: " + v.getDateVerification() + ", Match: " + match);
                        return match;
                    })
                    .collect(Collectors.toList());
                System.out.println("Après filtre période: " + filtered.size());
            } catch (NumberFormatException e) {
                System.out.println("Erreur parsing période: " + periode);
            }
        }
        
        // Conversion en DTO
        List<VerificationRaccordDTO> result = filtered.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        System.out.println("=== FIN getVerificationsFiltrees - Résultats: " + result.size() + " ===");
        return result;
        
    } catch (Exception e) {
        System.err.println("ERREUR CRITIQUE dans getVerificationsFiltrees:");
        e.printStackTrace();
        throw new RuntimeException("Erreur lors du chargement des vérifications: " + e.getMessage(), e);
    }
}
    
    // Méthode utilitaire pour obtenir le code du statut
    private String getStatutVerificationCode(VerificationRaccord verification) {
        return verification.getStatutVerification() != null ? 
            verification.getStatutVerification().getCode() : "A_VERIFIER";
    }
    
    public DetailVerificationDTO getDetailsVerification(Long id) {
        VerificationRaccord verification = verificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vérification non trouvée"));
        
        List<RaccordImage> preuves = preuveRepository.findByRaccordId(verification.getRaccord().getId());
        List<VerificationRaccord> historique = 
                verificationRepository.findByRaccordIdOrderByDateVerificationDesc(verification.getRaccord().getId());
        
        return convertToDetailDTO(verification, preuves, historique);
    }
    
    public StatistiquesVerificationDTO getStatistiques() {
        List<VerificationRaccord> allVerifications = verificationRepository.findAll();
        
        long total = allVerifications.size();
        long conformes = allVerifications.stream()
                .filter(v -> "CONFORME".equals(getStatutVerificationCode(v)))
                .count();
        long nonConformes = allVerifications.stream()
                .filter(v -> "NON_CONFORME".equals(getStatutVerificationCode(v)))
                .count();
        long critiques = allVerifications.stream()
                .filter(v -> v.getRaccord().getEstCritique())
                .count();
        
        // Calculer les vérifications ce mois-ci
        LocalDate debutMois = LocalDate.now().withDayOfMonth(1);
        long verificationsCeMois = allVerifications.stream()
                .filter(v -> v.getDateVerification().toLocalDate().isAfter(debutMois.minusDays(1)))
                .count();
        
        return new StatistiquesVerificationDTO(
            total,
            conformes,
            nonConformes,
            critiques,
            total > 0 ? (double) conformes / total * 100 : 0,
            "2h 30m",
            (int) verificationsCeMois,
            "85%"
        );
    }
    
    public byte[] genererRapportVerifications(String statut, Long typeRaccordId, 
                                            Boolean critique, String periode) {
        // Implémentation simplifiée - générer un PDF basique
        try {
            String rapportContent = "Rapport des Vérifications de Raccords\n\n";
            rapportContent += "Généré le: " + LocalDate.now() + "\n\n";
            
            List<VerificationRaccordDTO> verifications = getVerificationsFiltrees(
                statut, typeRaccordId, critique, periode);
            
            for (VerificationRaccordDTO v : verifications) {
                rapportContent += String.format(
                    "Raccord: %s | Statut: %s | Vérificateur: %s | Date: %s\n",
                    v.getRaccordDescription(),
                    v.getStatutVerificationNom(), // CORRECTION : Utiliser getStatutVerificationNom() au lieu de getStatutVerification()
                    v.getVerificateurNom(),
                    v.getDateVerification()
                );
            }
            
            return rapportContent.getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du rapport", e);
        }
    }
    
    public byte[] creerArchivePreuves(Long verificationId) throws IOException {
        VerificationRaccord verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Vérification non trouvée"));
        
        List<RaccordImage> preuves = preuveRepository.findByRaccordId(verification.getRaccord().getId());
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ZipOutputStream zos = new ZipOutputStream(baos);
        
        for (RaccordImage preuve : preuves) {
            Path filePath = Paths.get("assets/raccords/" + preuve.getCheminFichier());
            if (Files.exists(filePath)) {
                ZipEntry entry = new ZipEntry(filePath.getFileName().toString());
                zos.putNextEntry(entry);
                Files.copy(filePath, zos);
                zos.closeEntry();
            }
        }
        
        zos.close();
        return baos.toByteArray();
    }
    
    public void mettreAJourStatut(Long verificationId, String nouveauStatutCode, String notes) {
        VerificationRaccord verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Vérification non trouvée"));
        
        // Trouver le statut correspondant
        StatutVerification nouveauStatut = statutVerificationRepository.findByCode(nouveauStatutCode)
                .orElseThrow(() -> new RuntimeException("Statut non trouvé: " + nouveauStatutCode));
        
        verification.setStatutVerification(nouveauStatut);
        verification.setNotesVerification(notes);
        verification.setDateVerification(LocalDateTime.now());
        
        verificationRepository.save(verification);
    }
    
    // Méthodes de conversion DTO
    private VerificationRaccordDTO convertToDTO(VerificationRaccord verification) {
    VerificationRaccordDTO dto = new VerificationRaccordDTO();
    dto.setId(verification.getId());
    
    if (verification.getRaccord() != null) {
        dto.setRaccordId(verification.getRaccord().getId());
        dto.setRaccordDescription(verification.getRaccord().getDescription());
        
        if (verification.getRaccord().getTypeRaccord() != null) {
            dto.setTypeRaccord(verification.getRaccord().getTypeRaccord().getNomType());
            dto.setTypeRaccordId(verification.getRaccord().getTypeRaccord().getId());
        }
        
        dto.setEstCritique(verification.getRaccord().getEstCritique());
        
        if (verification.getRaccord().getSceneSource() != null) {
            dto.setSceneSourceTitre(verification.getRaccord().getSceneSource().getTitre());
        }
        
        if (verification.getRaccord().getSceneCible() != null) {
            dto.setSceneCibleTitre(verification.getRaccord().getSceneCible().getTitre());
        }
        
        // Récupérer l'ID du projet
        if (verification.getRaccord().getSceneSource() != null &&
            verification.getRaccord().getSceneSource().getSequence() != null &&
            verification.getRaccord().getSceneSource().getSequence().getEpisode() != null &&
            verification.getRaccord().getSceneSource().getSequence().getEpisode().getProjet() != null) {
            dto.setProjetId(verification.getRaccord().getSceneSource().getSequence().getEpisode().getProjet().getId());
        }
    }
    
    if (verification.getUtilisateur() != null) {
        dto.setVerificateurNom(verification.getUtilisateur().getNom());
        dto.setVerificateurRole(verification.getUtilisateur().getRole());
    }
    
    dto.setStatutVerificationNom(getStatutVerificationCode(verification));
    dto.setDateVerification(verification.getDateVerification());
    dto.setNotes(verification.getNotesVerification());
    
    // Compter le nombre de preuves
    if (verification.getRaccord() != null) {
        int nombrePreuves = preuveRepository.findByRaccordId(verification.getRaccord().getId()).size();
        dto.setNombrePreuves(nombrePreuves);
    } else {
        dto.setNombrePreuves(0);
    }
    
    return dto;
}
    
    private DetailVerificationDTO convertToDetailDTO(VerificationRaccord verification, 
                                                   List<RaccordImage> preuves, 
                                                   List<VerificationRaccord> historique) {
        DetailVerificationDTO dto = new DetailVerificationDTO();
        dto.setId(verification.getId());
        dto.setRaccordDescription(verification.getRaccord().getDescription());
        dto.setTypeRaccord(verification.getRaccord().getTypeRaccord().getNomType());
        dto.setStatutVerification(getStatutVerificationCode(verification));
        dto.setEstCritique(verification.getRaccord().getEstCritique());
        dto.setSceneSourceTitre(verification.getRaccord().getSceneSource().getTitre());
        dto.setSceneCibleTitre(verification.getRaccord().getSceneCible().getTitre());
        dto.setVerificateurNom(verification.getUtilisateur().getNom());
        dto.setVerificateurRole(verification.getUtilisateur().getRole());
        dto.setDateVerification(verification.getDateVerification());
        dto.setNotes(verification.getNotesVerification());
        
        // Convertir les preuves
        List<PreuveDTO> preuvesDTO = preuves.stream()
                .map(this::convertPreuveToDTO)
                .collect(Collectors.toList());
        dto.setPreuves(preuvesDTO);
        
        // Convertir l'historique
        List<HistoriqueVerificationDTO> historiqueDTO = historique.stream()
                .map(this::convertHistoriqueToDTO)
                .collect(Collectors.toList());
        dto.setHistorique(historiqueDTO);
        
        return dto;
    }
    
    private PreuveDTO convertPreuveToDTO(RaccordImage preuve) {
        PreuveDTO dto = new PreuveDTO();
        dto.setId(preuve.getId());
        dto.setNomFichier(preuve.getNomFichier());
        dto.setCheminFichier(preuve.getCheminFichier());
        dto.setDescription(preuve.getDescriptionImage());
        dto.setDateCreation(preuve.getCreeLe());
        return dto;
    }
    
    private HistoriqueVerificationDTO convertHistoriqueToDTO(VerificationRaccord historique) {
        HistoriqueVerificationDTO dto = new HistoriqueVerificationDTO();
        dto.setId(historique.getId());
        dto.setStatut(getStatutVerificationCode(historique));
        dto.setDate(historique.getDateVerification());
        dto.setVerificateur(historique.getUtilisateur().getNom());
        dto.setNotes(historique.getNotesVerification());
        return dto;
    }
}
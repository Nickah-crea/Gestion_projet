package com.example.films.service;

import com.example.films.dto.ProfilUtilisateurDTO;
import com.example.films.dto.UpdateProfilRequest;
import com.example.films.dto.PhotoProfileResponse;
import com.example.films.entity.Utilisateur;
import com.example.films.entity.Scenariste;
import com.example.films.entity.Realisateur;
import com.example.films.repository.UtilisateurRepository;
import com.example.films.repository.ScenaristeRepository;
import com.example.films.repository.RealisateurRepository;
import com.example.films.exception.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProfilService {
    
    private final UtilisateurRepository utilisateurRepository;
    private final ScenaristeRepository scenaristeRepository;
    private final RealisateurRepository realisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final String profilePhotosDir = "assets/profile-photos/";
    
    public ProfilService(UtilisateurRepository utilisateurRepository,
                        ScenaristeRepository scenaristeRepository,
                        RealisateurRepository realisateurRepository,
                        PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.scenaristeRepository = scenaristeRepository;
        this.realisateurRepository = realisateurRepository;
        this.passwordEncoder = passwordEncoder;
        
        // Créer le répertoire pour les photos de profil
        try {
            Files.createDirectories(Paths.get(profilePhotosDir));
        } catch (IOException e) {
            throw new FileStorageException("Impossible de créer le répertoire de stockage des photos de profil", e);
        }
    }
    
    public ProfilUtilisateurDTO getProfilUtilisateur(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        
        return convertToProfilDTO(utilisateur);
    }
    
    @Transactional
    public ProfilUtilisateurDTO updateProfil(Long utilisateurId, UpdateProfilRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        
        // Vérifier l'unicité de l'email
        if (request.getEmail() != null && !utilisateur.getEmail().equals(request.getEmail())) {
            if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new DuplicateResourceException("Utilisateur", "email", request.getEmail());
            }
            utilisateur.setEmail(request.getEmail());
        }
        
        // Mettre à jour les informations de base
        if (request.getNom() != null) {
            utilisateur.setNom(request.getNom());
        }
        
        // Vérifier et mettre à jour le mot de passe si nécessaire
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getCurrentPassword() == null) {
                throw new BusinessValidationException("Le mot de passe actuel est requis pour changer le mot de passe");
            }
            
            if (!passwordEncoder.matches(request.getCurrentPassword(), utilisateur.getMotDePasse())) {
                throw new BusinessValidationException("Le mot de passe actuel est incorrect");
            }
            
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        }
        
        Utilisateur utilisateurMisAJour = utilisateurRepository.save(utilisateur);
        
        // Mettre à jour les informations spécifiques au rôle
        updateRoleSpecificInfo(utilisateurId, request);
        
        return convertToProfilDTO(utilisateurMisAJour);
    }
    
    private void updateRoleSpecificInfo(Long utilisateurId, UpdateProfilRequest request) {
        String role = utilisateurRepository.findById(utilisateurId)
                .map(Utilisateur::getRole)
                .orElse("");
        
        if ("SCENARISTE".equals(role)) {
            Scenariste scenariste = scenaristeRepository.findByUtilisateurId(utilisateurId)
                    .orElseThrow(() -> new ResourceNotFoundException("Scénariste", "utilisateurId", utilisateurId));
            
            if (request.getSpecialite() != null) {
                scenariste.setSpecialite(request.getSpecialite());
            }
            if (request.getBiographie() != null) {
                scenariste.setBiographie(request.getBiographie());
            }
            
            scenaristeRepository.save(scenariste);
        } else if ("REALISATEUR".equals(role)) {
            Realisateur realisateur = realisateurRepository.findByUtilisateurId(utilisateurId)
                    .orElseThrow(() -> new ResourceNotFoundException("Réalisateur", "utilisateurId", utilisateurId));
            
            if (request.getSpecialite() != null) {
                realisateur.setSpecialite(request.getSpecialite());
            }
            if (request.getBiographie() != null) {
                realisateur.setBiographie(request.getBiographie());
            }
            
            realisateurRepository.save(realisateur);
        }
    }
    
    // MÉTHODE UNIFIÉE POUR SAUVEGARDER LES PHOTOS (identique à ComedienService)
    public String saveProfilePhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BusinessValidationException("Le fichier photo est vide");
        }

        // Validation du type de fichier
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessValidationException("Le fichier doit être une image");
        }

        // Validation de la taille (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new BusinessValidationException("La taille de l'image ne doit pas dépasser 5MB");
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Chemin complet du fichier
        Path filePath = Paths.get(profilePhotosDir + uniqueFilename);
        
        // Sauvegarder le fichier
        try {
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new FileStorageException("Erreur lors de la sauvegarde de la photo de profil", e);
        }

        return uniqueFilename;
    }
    
    @Transactional
    public PhotoProfileResponse uploadProfilePhoto(Long utilisateurId, MultipartFile file) throws IOException {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        
        // Sauvegarder la photo en utilisant la méthode standardisée
        String uniqueFilename = saveProfilePhoto(file);
        
        // Supprimer l'ancienne photo si elle existe
        if (utilisateur.getProfilePhotoPath() != null) {
            deleteProfilePhotoFile(utilisateur.getProfilePhotoPath());
        }
        
        // Mettre à jour le chemin dans la base de données
        utilisateur.setProfilePhotoPath(uniqueFilename);
        utilisateurRepository.save(utilisateur);
        
        PhotoProfileResponse response = new PhotoProfileResponse();
        response.setProfilePhotoPath(uniqueFilename);
        response.setMessage("Photo de profil téléchargée avec succès");
        
        return response;
    }
    
    public byte[] getProfilePhoto(String filename) throws IOException {
        Path filePath = Paths.get(profilePhotosDir + filename);
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Photo de profil", "filename", filename);
        }
        
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new FileStorageException("Erreur lors de la lecture de la photo de profil", e);
        }
    }
    
    public void deleteProfilePhotoFile(String filename) throws IOException {
        if (filename != null) {
            Path filePath = Paths.get(profilePhotosDir + filename);
            if (Files.exists(filePath)) {
                try {
                    Files.delete(filePath);
                } catch (IOException e) {
                    throw new FileStorageException("Erreur lors de la suppression de la photo de profil", e);
                }
            }
        }
    }
    
    @Transactional
    public void deleteProfilePhoto(Long utilisateurId) throws IOException {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        
        if (utilisateur.getProfilePhotoPath() == null) {
            throw new ResourceNotFoundException("Photo de profil", "utilisateurId", utilisateurId);
        }
        
        // Supprimer le fichier physique
        deleteProfilePhotoFile(utilisateur.getProfilePhotoPath());
        
        // Mettre à jour la base de données
        utilisateur.setProfilePhotoPath(null);
        utilisateurRepository.save(utilisateur);
    }
    
    // MÉTHODE POUR LA MISE À JOUR DE LA PHOTO (identique au pattern Comedien)
    @Transactional
    public PhotoProfileResponse updateProfilePhoto(Long utilisateurId, MultipartFile file) throws IOException {
        return uploadProfilePhoto(utilisateurId, file); // Même logique
    }
    
    private ProfilUtilisateurDTO convertToProfilDTO(Utilisateur utilisateur) {
        ProfilUtilisateurDTO dto = new ProfilUtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setEmail(utilisateur.getEmail());
        dto.setRole(utilisateur.getRole());
        dto.setProfilePhotoPath(utilisateur.getProfilePhotoPath());
        dto.setCreeLe(utilisateur.getCreeLe());
        dto.setModifieLe(utilisateur.getModifieLe());
        
        // Ajouter les informations spécifiques au rôle
        if ("SCENARISTE".equals(utilisateur.getRole())) {
            Scenariste scenariste = scenaristeRepository.findByUtilisateurId(utilisateur.getId())
                    .orElse(null);
            if (scenariste != null) {
                dto.setSpecialite(scenariste.getSpecialite());
                dto.setBiographie(scenariste.getBiographie());
            }
        } else if ("REALISATEUR".equals(utilisateur.getRole())) {
            Realisateur realisateur = realisateurRepository.findByUtilisateurId(utilisateur.getId())
                    .orElse(null);
            if (realisateur != null) {
                dto.setSpecialite(realisateur.getSpecialite());
                dto.setBiographie(realisateur.getBiographie());
            }
        }
        
        return dto;
    }
}


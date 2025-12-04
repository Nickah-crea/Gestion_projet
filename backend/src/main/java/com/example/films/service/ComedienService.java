package com.example.films.service;

import com.example.films.dto.ComedienDTO;
import com.example.films.dto.CreateComedienDTO;
import com.example.films.dto.DisponibiliteDTO;
import com.example.films.entity.Comedien;
import com.example.films.entity.DisponibiliteComedien;
import com.example.films.entity.Projet;
import com.example.films.repository.ComedienRepository;
import com.example.films.repository.DisponibiliteComedienRepository;
import com.example.films.repository.ProjetRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
public class ComedienService {
    private final ComedienRepository comedienRepository;
    private final DisponibiliteComedienRepository disponibiliteRepository;
    private final ProjetRepository projetRepository; 
    private final String uploadDir = "assets/photos/";

     public ComedienService(ComedienRepository comedienRepository, 
                         DisponibiliteComedienRepository disponibiliteRepository,
                         ProjetRepository projetRepository) {
        this.comedienRepository = comedienRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.projetRepository = projetRepository;
        
        // Créer le répertoire s'il n'existe pas
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage", e);
        }
    }

        @Transactional
        public ComedienDTO createComedien(CreateComedienDTO createComedienDTO) {
            // Vérifier si l'email existe déjà
            if (comedienRepository.findByEmail(createComedienDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Un comédien avec cet email existe déjà");
            }

            // Récupérer le projet
            Projet projet = projetRepository.findById(createComedienDTO.getProjetId())
                    .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

            // Créer le comédien
            Comedien comedien = new Comedien();
            comedien.setProjet(projet);
            comedien.setNom(createComedienDTO.getNom());
            comedien.setAge(createComedienDTO.getAge());
            comedien.setEmail(createComedienDTO.getEmail());
            comedien.setPhotoPath(createComedienDTO.getPhotoPath());

            Comedien savedComedien = comedienRepository.save(comedien);

            // Créer les disponibilités multiples si fournies
            if (createComedienDTO.getDatesDisponibilite() != null && 
                createComedienDTO.getStatutsDisponibilite() != null &&
                !createComedienDTO.getDatesDisponibilite().isEmpty()) {
                
                for (int i = 0; i < createComedienDTO.getDatesDisponibilite().size(); i++) {
                    if (i < createComedienDTO.getStatutsDisponibilite().size()) {
                        DisponibiliteComedien disponibilite = new DisponibiliteComedien();
                        disponibilite.setComedien(savedComedien);
                        disponibilite.setDate(createComedienDTO.getDatesDisponibilite().get(i));
                        disponibilite.setStatut(createComedienDTO.getStatutsDisponibilite().get(i));
                        disponibiliteRepository.save(disponibilite);
                    }
                }
            }

            return convertToDTO(savedComedien);
        }

     public List<ComedienDTO> getComediensByProjet(Long projetId) {
        List<Comedien> comediens = comedienRepository.findByProjetIdWithDisponibilites(projetId);
        return comediens.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

        public String savePhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier est vide");
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Chemin complet du fichier
        Path filePath = Paths.get(uploadDir + uniqueFilename);
        
        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath);

        return uniqueFilename;
    }

    public byte[] getPhoto(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir + filename);
        return Files.readAllBytes(filePath);
    }

    public void deletePhoto(String filename) throws IOException {
        if (filename != null) {
            Path filePath = Paths.get(uploadDir + filename);
            Files.deleteIfExists(filePath);
        }
    }

    public List<ComedienDTO> getAllComediens() {
        List<Comedien> comediens = comedienRepository.findAllWithDisponibilites();
        return comediens.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ComedienDTO getComedienById(Long id) {
        Comedien comedien = comedienRepository.findByIdWithDisponibilites(id)
                .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));
        return convertToDTO(comedien);
    }

      @Transactional
public ComedienDTO updateComedien(Long id, CreateComedienDTO updateComedienDTO) {
    Comedien comedien = comedienRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));

    // Vérifier si l'email est déjà utilisé par un autre comédien
    if (updateComedienDTO.getEmail() != null && 
        !comedien.getEmail().equals(updateComedienDTO.getEmail()) &&
        comedienRepository.findByEmail(updateComedienDTO.getEmail()).isPresent()) {
        throw new RuntimeException("Un autre comédien utilise déjà cet email");
    }

    // Mettre à jour seulement les champs non-nulls
    if (updateComedienDTO.getNom() != null) {
        comedien.setNom(updateComedienDTO.getNom());
    }
    if (updateComedienDTO.getAge() != null) {
        comedien.setAge(updateComedienDTO.getAge());
    }
    if (updateComedienDTO.getEmail() != null) {
        comedien.setEmail(updateComedienDTO.getEmail());
    }
    if (updateComedienDTO.getPhotoPath() != null) {
        // Supprimer l'ancienne photo si elle existe
        if (comedien.getPhotoPath() != null) {
            try {
                deletePhoto(comedien.getPhotoPath());
            } catch (IOException e) {
                System.err.println("Erreur lors de la suppression de l'ancienne photo: " + e.getMessage());
            }
        }
        comedien.setPhotoPath(updateComedienDTO.getPhotoPath());
    }

    // Sauvegarder le comédien d'abord
    Comedien updatedComedien = comedienRepository.save(comedien);
    
    // Gérer les disponibilités
    handleDisponibilitesUpdate(comedien, updateComedienDTO);

    return convertToDTO(updatedComedien);
}

@Transactional
private void handleDisponibilitesUpdate(Comedien comedien, CreateComedienDTO updateComedienDTO) {
    // Supprimer TOUTES les disponibilités existantes de ce comédien
    disponibiliteRepository.deleteByComedienId(comedien.getId());
    
    // Recréer les disponibilités seulement si des nouvelles sont fournies
    if (updateComedienDTO.getDatesDisponibilite() != null && 
        updateComedienDTO.getStatutsDisponibilite() != null &&
        !updateComedienDTO.getDatesDisponibilite().isEmpty()) {
        
        for (int i = 0; i < updateComedienDTO.getDatesDisponibilite().size(); i++) {
            if (i < updateComedienDTO.getStatutsDisponibilite().size()) {
                LocalDate date = updateComedienDTO.getDatesDisponibilite().get(i);
                String statut = updateComedienDTO.getStatutsDisponibilite().get(i);
                
                if (date != null && statut != null) {
                    DisponibiliteComedien newDisponibilite = new DisponibiliteComedien();
                    newDisponibilite.setComedien(comedien);
                    newDisponibilite.setDate(date);
                    newDisponibilite.setStatut(statut);
                    disponibiliteRepository.save(newDisponibilite);
                }
            }
        }
    }
}

        @Transactional
        private void updateOrCreateDisponibilites(Comedien comedien, List<LocalDate> dates, List<String> statuts) {
            // Récupérer toutes les disponibilités existantes pour ce comédien
            List<DisponibiliteComedien> existingDisponibilites = disponibiliteRepository.findByComedienId(comedien.getId());
            
            // Créer une map pour vérifier quelles disponibilités existent encore
            Map<LocalDate, DisponibiliteComedien> existingMap = new HashMap<>();
            for (DisponibiliteComedien dispo : existingDisponibilites) {
                existingMap.put(dispo.getDate(), dispo);
            }
            
            // Préparer les nouvelles disponibilités
            Map<LocalDate, String> newDisponibilites = new HashMap<>();
            if (dates != null && statuts != null) {
                for (int i = 0; i < dates.size(); i++) {
                    if (i < statuts.size() && dates.get(i) != null) {
                        newDisponibilites.put(dates.get(i), statuts.get(i));
                    }
                }
            }
            
            // Supprimer les disponibilités qui ne sont plus dans la liste
            List<DisponibiliteComedien> toDelete = new ArrayList<>();
            for (DisponibiliteComedien existing : existingDisponibilites) {
                if (!newDisponibilites.containsKey(existing.getDate())) {
                    toDelete.add(existing);
                }
            }
            disponibiliteRepository.deleteAll(toDelete);
            
            // Mettre à jour ou créer les nouvelles disponibilités
            for (Map.Entry<LocalDate, String> entry : newDisponibilites.entrySet()) {
                LocalDate date = entry.getKey();
                String statut = entry.getValue();
                
                if (existingMap.containsKey(date)) {
                    // Mettre à jour la disponibilité existante
                    DisponibiliteComedien existing = existingMap.get(date);
                    existing.setStatut(statut);
                    disponibiliteRepository.save(existing);
                } else {
                    // Créer une nouvelle disponibilité
                    DisponibiliteComedien newDisponibilite = new DisponibiliteComedien();
                    newDisponibilite.setComedien(comedien);
                    newDisponibilite.setDate(date);
                    newDisponibilite.setStatut(statut);
                    disponibiliteRepository.save(newDisponibilite);
                }
            }
        }
    @Transactional
   public void deleteComedien(Long id) {
        Comedien comedien = comedienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));
        
        // Supprimer la photo associée
        if (comedien.getPhotoPath() != null) {
            try {
                deletePhoto(comedien.getPhotoPath());
            } catch (IOException e) {
                // Log l'erreur mais continue la suppression
                System.err.println("Erreur lors de la suppression de la photo: " + e.getMessage());
            }
        }
        
        comedienRepository.delete(comedien);
    }

    @Transactional
    public void addDisponibilite(Long comedienId, LocalDate date, String statut) {
        Comedien comedien = comedienRepository.findById(comedienId)
                .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));

        // Vérifier si une disponibilité existe déjà pour cette date
        Optional<DisponibiliteComedien> existing = disponibiliteRepository
                .findByComedienIdAndDate(comedienId, date);

        if (existing.isPresent()) {
            throw new RuntimeException("Une disponibilité existe déjà pour cette date");
        }

        DisponibiliteComedien disponibilite = new DisponibiliteComedien(comedien, date, statut);
        disponibiliteRepository.save(disponibilite);
    }

    @Transactional
    public void updateDisponibilite(Long comedienId, Long disponibiliteId, LocalDate date, String statut) {
        Comedien comedien = comedienRepository.findById(comedienId)
            .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));
        
        DisponibiliteComedien disponibilite = disponibiliteRepository.findById(disponibiliteId)
            .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée"));
        
        // Vérifier que la disponibilité appartient bien au comédien
        if (!disponibilite.getComedien().getId().equals(comedienId)) {
            throw new RuntimeException("Cette disponibilité n'appartient pas à ce comédien");
        }
        
        disponibilite.setDate(date);
        disponibilite.setStatut(statut);
        
        disponibiliteRepository.save(disponibilite);
    }

    @Transactional
    public void deleteDisponibilite(Long comedienId, Long disponibiliteId) {
        Comedien comedien = comedienRepository.findById(comedienId)
            .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));
        
        DisponibiliteComedien disponibilite = disponibiliteRepository.findById(disponibiliteId)
            .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée"));
        
        // Vérifier que la disponibilité appartient bien au comédien
        if (!disponibilite.getComedien().getId().equals(comedienId)) {
            throw new RuntimeException("Cette disponibilité n'appartient pas à ce comédien");
        }
        
        disponibiliteRepository.delete(disponibilite);
    }

    private ComedienDTO convertToDTO(Comedien comedien) {
        ComedienDTO dto = new ComedienDTO();
        dto.setId(comedien.getId());
        dto.setNom(comedien.getNom());
        dto.setAge(comedien.getAge());
        dto.setEmail(comedien.getEmail());
        dto.setPhotoPath(comedien.getPhotoPath());
        dto.setCreeLe(comedien.getCreeLe());
        dto.setModifieLe(comedien.getModifieLe());

        // Ajouter les informations du projet
        if (comedien.getProjet() != null) {
            dto.setProjetId(comedien.getProjet().getId());
            dto.setProjetTitre(comedien.getProjet().getTitre());
        }

        // Convertir les disponibilités
        if (comedien.getDisponibilites() != null) {
            List<DisponibiliteDTO> disponibilitesDTO = comedien.getDisponibilites().stream()
                    .map(this::convertDisponibiliteToDTO)
                    .collect(Collectors.toList());
            dto.setDisponibilites(disponibilitesDTO);
        }

        return dto;
    }


private DisponibiliteDTO convertDisponibiliteToDTO(DisponibiliteComedien disponibilite) {
        DisponibiliteDTO dto = new DisponibiliteDTO();
        dto.setId(disponibilite.getId());
        dto.setDate(disponibilite.getDate());
        dto.setStatut(disponibilite.getStatut());
        return dto;
    }
}
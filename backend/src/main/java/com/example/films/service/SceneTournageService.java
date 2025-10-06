package com.example.films.service;

import com.example.films.dto.CreateSceneTournageDTO;
import com.example.films.dto.SceneTournageDTO;
import com.example.films.entity.*;
import com.example.films.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SceneTournageService {
    private final SceneTournageRepository sceneTournageRepository;
    private final SceneRepository sceneRepository;
    private final LieuRepository lieuRepository;
    private final PlateauRepository plateauRepository;
    private final ComedienRepository comedienRepository;

    public SceneTournageService(SceneTournageRepository sceneTournageRepository,
                              SceneRepository sceneRepository,
                              LieuRepository lieuRepository,
                              PlateauRepository plateauRepository,
                              ComedienRepository comedienRepository) {
        this.sceneTournageRepository = sceneTournageRepository;
        this.sceneRepository = sceneRepository;
        this.lieuRepository = lieuRepository;
        this.plateauRepository = plateauRepository;
        this.comedienRepository = comedienRepository;
    }

    public List<SceneTournageDTO> getTournagesByDate(LocalDate date) {
        List<SceneTournage> tournages = sceneTournageRepository.findByDateTournage(date);
        return tournages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<SceneTournageDTO> getTournagesByDateRange(LocalDate startDate, LocalDate endDate) {
        List<SceneTournage> tournages = sceneTournageRepository.findByDateTournageBetween(startDate, endDate);
        return tournages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<SceneTournageDTO> getTournagesByStatut(String statut) {
        List<SceneTournage> tournages = sceneTournageRepository.findByStatutTournage(statut);
        return tournages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<SceneTournageDTO> getTournagesByProjet(Long projetId) {
        List<SceneTournage> tournages = sceneTournageRepository.findByProjetId(projetId);
        return tournages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // SUPPRIMER LA MÉTHODE DUPLIQUÉE - GARDER SEULEMENT CETTE VERSION
    public SceneTournageDTO getTournageBySceneId(Long sceneId) {
        SceneTournage tournage = sceneTournageRepository.findBySceneId(sceneId)
                .orElse(null);
        return tournage != null ? convertToDTO(tournage) : null;
    }

    public SceneTournageDTO getTournageById(Long id) {
        SceneTournage tournage = sceneTournageRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Tournage non trouvé"));
        return convertToDTO(tournage);
    }

    @Transactional
    public SceneTournageDTO planifierTournage(CreateSceneTournageDTO createDTO) {
        // Vérifier si la scène est déjà planifiée
        if (sceneTournageRepository.existsBySceneId(createDTO.getSceneId())) {
            throw new RuntimeException("Cette scène est déjà planifiée");
        }

        // Vérifier les conflits de dates pour les comédiens
        verifierConflitsComediens(createDTO);

        SceneTournage tournage = new SceneTournage();
        
        Scene scene = sceneRepository.findByIdWithDetails(createDTO.getSceneId())
                .orElseThrow(() -> new RuntimeException("Scène non trouvée"));
        tournage.setScene(scene);
        
        tournage.setDateTournage(createDTO.getDateTournage());
        tournage.setHeureDebut(createDTO.getHeureDebut());
        tournage.setHeureFin(createDTO.getHeureFin());
        tournage.setStatutTournage("planifie");
        tournage.setNotes(createDTO.getNotes());

        if (createDTO.getLieuId() != null) {
            Lieu lieu = lieuRepository.findById(createDTO.getLieuId())
                    .orElseThrow(() -> new RuntimeException("Lieu non trouvé"));
            tournage.setLieu(lieu);
        }

        if (createDTO.getPlateauId() != null) {
            Plateau plateau = plateauRepository.findById(createDTO.getPlateauId())
                    .orElseThrow(() -> new RuntimeException("Plateau non trouvé"));
            tournage.setPlateau(plateau);
        }

        SceneTournage saved = sceneTournageRepository.save(tournage);
        return convertToDTO(saved);
    }

    @Transactional
    public SceneTournageDTO modifierStatut(Long id, String nouveauStatut) {
        SceneTournage tournage = sceneTournageRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Tournage non trouvé"));

        // Empêcher la modification d'un tournage terminé
        if ("termine".equals(tournage.getStatutTournage())) {
            throw new RuntimeException("Impossible de modifier un tournage terminé");
        }

        tournage.setStatutTournage(nouveauStatut);
        SceneTournage updated = sceneTournageRepository.save(tournage);
        return convertToDTO(updated);
    }

    @Transactional
    public SceneTournageDTO modifierTournage(Long id, CreateSceneTournageDTO updateDTO) {
        SceneTournage tournage = sceneTournageRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Tournage non trouvé"));

        // Empêcher la modification d'un tournage terminé
        if ("termine".equals(tournage.getStatutTournage())) {
            throw new RuntimeException("Impossible de modifier un tournage terminé");
        }

        tournage.setDateTournage(updateDTO.getDateTournage());
        tournage.setHeureDebut(updateDTO.getHeureDebut());
        tournage.setHeureFin(updateDTO.getHeureFin());
        tournage.setNotes(updateDTO.getNotes());

        if (updateDTO.getLieuId() != null) {
            Lieu lieu = lieuRepository.findById(updateDTO.getLieuId())
                    .orElseThrow(() -> new RuntimeException("Lieu non trouvé"));
            tournage.setLieu(lieu);
        }

        if (updateDTO.getPlateauId() != null) {
            Plateau plateau = plateauRepository.findById(updateDTO.getPlateauId())
                    .orElseThrow(() -> new RuntimeException("Plateau non trouvé"));
            tournage.setPlateau(plateau);
        }

        // Vérifier les conflits après modification
        verifierConflitsComediens(updateDTO);

        SceneTournage updated = sceneTournageRepository.save(tournage);
        return convertToDTO(updated);
    }

    @Transactional
    public void supprimerTournage(Long id) {
        SceneTournage tournage = sceneTournageRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Tournage non trouvé"));
        
        // Empêcher la suppression d'un tournage terminé
        if ("termine".equals(tournage.getStatutTournage())) {
            throw new RuntimeException("Impossible de supprimer un tournage terminé");
        }
        
        sceneTournageRepository.delete(tournage);
    }

    public List<SceneTournageDTO> getTournagesAConfirmer() {
        LocalDate dateLimite = LocalDate.now().plusDays(2); // 2 jours à l'avance
        List<SceneTournage> tournages = sceneTournageRepository.findTournagesAConfirmer(dateLimite);
        return tournages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private void verifierConflitsComediens(CreateSceneTournageDTO dto) {
        // Implémentation de la vérification des conflits pour les comédiens
        // Cette méthode vérifierait si les comédiens de la scène ont d'autres tournages aux mêmes dates/heures
    }

    private SceneTournageDTO convertToDTO(SceneTournage tournage) {
        SceneTournageDTO dto = new SceneTournageDTO();
        dto.setId(tournage.getId());
        dto.setSceneId(tournage.getScene().getId());
        dto.setSceneTitre(tournage.getScene().getTitre());
        dto.setSequenceId(tournage.getScene().getSequence().getId());
        dto.setSequenceTitre(tournage.getScene().getSequence().getTitre());
        dto.setEpisodeId(tournage.getScene().getSequence().getEpisode().getId());
        dto.setEpisodeTitre(tournage.getScene().getSequence().getEpisode().getTitre());
        dto.setProjetId(tournage.getScene().getSequence().getEpisode().getProjet().getId());
        dto.setProjetTitre(tournage.getScene().getSequence().getEpisode().getProjet().getTitre());
        dto.setDateTournage(tournage.getDateTournage());
        dto.setHeureDebut(tournage.getHeureDebut());
        dto.setHeureFin(tournage.getHeureFin());
        dto.setStatutTournage(tournage.getStatutTournage());
        dto.setNotes(tournage.getNotes());
        dto.setCreeLe(tournage.getCreeLe());
        dto.setModifieLe(tournage.getModifieLe());

        // Libellé du statut
        dto.setStatutTournageLibelle(getLibelleStatut(tournage.getStatutTournage()));

        if (tournage.getLieu() != null) {
            dto.setLieuId(tournage.getLieu().getId());
            dto.setLieuNom(tournage.getLieu().getNomLieu());
        }

        if (tournage.getPlateau() != null) {
            dto.setPlateauId(tournage.getPlateau().getId());
            dto.setPlateauNom(tournage.getPlateau().getNom());
        }

        // CORRECTION : Utilisation de la méthode findBySceneId maintenant disponible
        List<Comedien> comediens = comedienRepository.findBySceneId(tournage.getScene().getId());
        dto.setNbComediens(comediens.size());
        dto.setNomsComediens(comediens.stream()
                .map(Comedien::getNom)
                .collect(Collectors.joining(", ")));

        return dto;
    }

    private String getLibelleStatut(String statut) {
        switch (statut) {
            case "planifie": return "Planifié";
            case "confirme": return "Confirmé";
            case "en_cours": return "En cours";
            case "termine": return "Terminé";
            case "reporte": return "Reporté";
            default: return statut;
        }
    }
}
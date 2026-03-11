package com.example.films.service;

import com.example.films.dto.CreateProjetDTO;
import com.example.films.dto.ProjetDTO;
import com.example.films.entity.Genre;
import com.example.films.entity.Projet;
import com.example.films.entity.ProjetStatut;
import com.example.films.entity.StatutProjet;
import com.example.films.repository.GenreRepository;
import com.example.films.repository.ProjetRepository;
import com.example.films.repository.ProjetStatutRepository;
import com.example.films.repository.StatutProjetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjetService {
    private final ProjetRepository projetRepository;
    private final ProjetStatutRepository projetStatutRepository;
    private final GenreRepository genreRepository;
    private final StatutProjetRepository statutProjetRepository;

    public ProjetService(ProjetRepository projetRepository, 
                        ProjetStatutRepository projetStatutRepository,
                        GenreRepository genreRepository,
                        StatutProjetRepository statutProjetRepository) {
        this.projetRepository = projetRepository;
        this.projetStatutRepository = projetStatutRepository;
        this.genreRepository = genreRepository;
        this.statutProjetRepository = statutProjetRepository;
    }

    public List<ProjetDTO> getAllProjetsWithDetails() {
        List<Projet> projets = projetRepository.findAllWithGenre();
        
        return projets.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProjetDTO createProjet(CreateProjetDTO createProjetDTO) {
    
        Projet projet = new Projet();
        projet.setTitre(createProjetDTO.getTitre());
        projet.setSynopsis(createProjetDTO.getSynopsis());
        projet.setDateDebut(createProjetDTO.getDateDebut());
        projet.setDateFin(createProjetDTO.getDateFin());
        
   
        Genre genre = genreRepository.findById(createProjetDTO.getGenreId())
                .orElseThrow(() -> new RuntimeException("Genre non trouvé"));
        projet.setGenre(genre);
        
       
        Projet savedProjet = projetRepository.save(projet);
        
     
        ProjetStatut projetStatut = new ProjetStatut();
        projetStatut.setProjet(savedProjet);
        
        StatutProjet statut = statutProjetRepository.findById(createProjetDTO.getStatutId())
                .orElseThrow(() -> new RuntimeException("Statut non trouvé"));
        projetStatut.setStatut(statut);
        projetStatut.setDateDebut(LocalDateTime.now());
        
        projetStatutRepository.save(projetStatut);
        

        return convertToDTO(savedProjet);
    }

    private ProjetDTO convertToDTO(Projet projet) {
        ProjetDTO dto = new ProjetDTO();
        dto.setId(projet.getId());
        dto.setTitre(projet.getTitre());
        dto.setSynopsis(projet.getSynopsis());
        dto.setDateDebut(projet.getDateDebut());
        dto.setDateFin(projet.getDateFin());
        dto.setCreeLe(projet.getCreeLe());
        dto.setModifieLe(projet.getModifieLe());
        
        if (projet.getGenre() != null) {
            dto.setGenreId(projet.getGenre().getIdGenre());
            dto.setGenreNom(projet.getGenre().getNomGenre());
        }
        
        // Récupérer le statut le plus récent
        Optional<ProjetStatut> statutOpt = projetStatutRepository.findLatestStatutByProjetId(projet.getId());
        if (statutOpt.isPresent()) {
            dto.setStatutNom(statutOpt.get().getStatut().getNomStatutsProjet());
        } else {
            dto.setStatutNom("Non défini");
        }
        
        // NOUVEAU : Définir la visibilité
        dto.setVisibleParTousScenaristes(determinerVisibiliteProjet(projet, dto.getStatutNom()));
        
        return dto;
    }

    // NOUVELLE MÉTHODE : Logique de détermination de visibilité
    private boolean determinerVisibiliteProjet(Projet projet, String statutNom) {
        // TODO: Implémenter votre logique métier ici
        // Par exemple :
        
        // Règle 1 : Projets avec statut "En cours" sont visibles
        if ("En cours".equals(statutNom)) return true;
        
        // Règle 2 : Projets de genre "Documentaire" sont visibles
        if (projet.getGenre() != null && "Documentaire".equals(projet.getGenre().getNomGenre())) return true;
        
        // Règle 3 : Projets récents (moins de 7 jours)
        if (projet.getCreeLe() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (projet.getCreeLe().plusDays(7).isAfter(now)) return true;
        }
        
        return false;
    }
    
    // Méthode pour mettre à jour un projet
    @Transactional
    public ProjetDTO updateProjet(Long id, CreateProjetDTO updateProjetDTO) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        
        projet.setTitre(updateProjetDTO.getTitre());
        projet.setSynopsis(updateProjetDTO.getSynopsis());
        projet.setDateDebut(updateProjetDTO.getDateDebut());
        projet.setDateFin(updateProjetDTO.getDateFin());
        
        if (updateProjetDTO.getGenreId() != null) {
            Genre genre = genreRepository.findById(updateProjetDTO.getGenreId())
                    .orElseThrow(() -> new RuntimeException("Genre non trouvé"));
            projet.setGenre(genre);
        }
        
        Projet updatedProjet = projetRepository.save(projet);
        
        // Mettre à jour le statut si nécessaire
        if (updateProjetDTO.getStatutId() != null) {
            Optional<ProjetStatut> currentStatutOpt = projetStatutRepository.findLatestStatutByProjetId(id);
            
            if (currentStatutOpt.isPresent()) {
                ProjetStatut currentStatut = currentStatutOpt.get();
                // Si le statut a changé, créer une nouvelle entrée
                if (!currentStatut.getStatut().getIdStatutProjet().equals(updateProjetDTO.getStatutId())) {
                    currentStatut.setDateFin(LocalDateTime.now());
                    projetStatutRepository.save(currentStatut);
                    
                    ProjetStatut newStatut = new ProjetStatut();
                    newStatut.setProjet(projet);
                    StatutProjet statut = statutProjetRepository.findById(updateProjetDTO.getStatutId())
                            .orElseThrow(() -> new RuntimeException("Statut non trouvé"));
                    newStatut.setStatut(statut);
                    newStatut.setDateDebut(LocalDateTime.now());
                    projetStatutRepository.save(newStatut);
                }
            }
        }
        
        return convertToDTO(updatedProjet);
    }

    // Méthode pour supprimer un projet
    @Transactional
    public void deleteProjet(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        projetRepository.delete(projet);
    }

    // Méthode pour récupérer un projet par ID
    public ProjetDTO getProjetById(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return convertToDTO(projet);
    }

    public List<ProjetDTO> getProjetsForUser(Long userId) {
        // Récupérer tous les projets
        List<Projet> allProjets = projetRepository.findAllWithGenre();
        
        // Récupérer les projets de l'utilisateur (où il est scénariste)
        List<Long> userProjetIds = getProjetIdsForUser(userId);
        
        return allProjets.stream()
            .filter(projet -> {
                // Garder le projet si :
                // 1. L'utilisateur est scénariste sur ce projet
                // 2. OU le projet est visible par tous les scénaristes
                return userProjetIds.contains(projet.getId()) || 
                    isProjetVisibleForAllScenaristes(projet);
            })
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private List<Long> getProjetIdsForUser(Long userId) {
        // Récupérer les IDs des projets où l'utilisateur est scénariste
        // À adapter selon votre structure de données
        String sql = """
            SELECT DISTINCT p.id_projet 
            FROM projets p
            JOIN episodes e ON p.id_projet = e.id_projet
            JOIN episode_scenaristes es ON e.id_episode = es.id_episode
            JOIN scenaristes s ON es.id_scenariste = s.id_scenariste
            WHERE s.id_utilisateur = :userId
        """;
        
        // Ou via votre repository existant
        return projetRepository.findProjetIdsByScenaristeUserId(userId);
    }

    private boolean isProjetVisibleForAllScenaristes(Projet projet) {
        // Logique pour déterminer si un projet est visible par tous les scénaristes
        // Par exemple : statut "En cours", genre spécifique, etc.
        
        // Récupérer le statut actuel du projet
        String statutNom = projetStatutRepository.findLatestStatutByProjetId(projet.getId())
            .map(ps -> ps.getStatut().getNomStatutsProjet())
            .orElse("");
        
        // Règles de visibilité
        boolean estEnCours = "En cours".equals(statutNom);
        boolean estDocumentaire = projet.getGenre() != null && 
                                "Documentaire".equals(projet.getGenre().getNomGenre());
        boolean estRecent = projet.getCreeLe() != null && 
                            projet.getCreeLe().plusDays(7).isAfter(LocalDateTime.now());
        
        return estEnCours || estDocumentaire || estRecent;
    }
}
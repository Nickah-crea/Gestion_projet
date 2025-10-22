// RechercheAvanceeService.java - AJOUT DES NOUVELLES MÉTHODES
package com.example.films.service;

import com.example.films.dto.RechercheAvanceeDTO;
import com.example.films.dto.CritereRechercheDTO;
import com.example.films.repository.*;
import com.example.films.entity.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RechercheAvanceeService {
    
    private final ProjetRepository projetRepository;
    private final EpisodeRepository episodeRepository;
    private final SequenceRepository sequenceRepository;
    private final SceneRepository sceneRepository;
    private final SceneTournageRepository sceneTournageRepository;
    private final PersonnageRepository personnageRepository;
    private final LieuRepository lieuRepository;
    private final PlateauRepository plateauRepository;
    private final DialogueRepository dialogueRepository;
    private final ComedienRepository comedienRepository;
    private final SceneStatutRepository sceneStatutRepository;
    
    public RechercheAvanceeService(ProjetRepository projetRepository,
                                 EpisodeRepository episodeRepository,
                                 SequenceRepository sequenceRepository,
                                 SceneRepository sceneRepository,
                                 SceneTournageRepository sceneTournageRepository,
                                 PersonnageRepository personnageRepository,
                                 LieuRepository lieuRepository,
                                 PlateauRepository plateauRepository,
                                 DialogueRepository dialogueRepository,
                                 ComedienRepository comedienRepository,
                                 SceneStatutRepository sceneStatutRepository) {
        this.projetRepository = projetRepository;
        this.episodeRepository = episodeRepository;
        this.sequenceRepository = sequenceRepository;
        this.sceneRepository = sceneRepository;
        this.sceneTournageRepository = sceneTournageRepository;
        this.personnageRepository = personnageRepository;
        this.lieuRepository = lieuRepository;
        this.plateauRepository = plateauRepository;
        this.dialogueRepository = dialogueRepository;
        this.comedienRepository = comedienRepository;
        this.sceneStatutRepository = sceneStatutRepository;
    }
    
    
    public List<RechercheAvanceeDTO> rechercherAvance(CritereRechercheDTO criteres) {
    // CORRECTION : Implémentation sans getTypeRecherche()
    List<RechercheAvanceeDTO> resultats = new ArrayList<>();
    
    if (criteres == null) {
        return resultats;
    }
    
    // Recherche dans tous les types par défaut
    resultats.addAll(rechercherScenes(criteres));
    resultats.addAll(rechercherPersonnages(criteres));
    resultats.addAll(rechercherLieux(criteres));
    resultats.addAll(rechercherPlateaux(criteres));
    
    // Appliquer le regroupement si demandé
    if (criteres.getRegroupement() != null && !criteres.getRegroupement().isEmpty()) {
        resultats = regrouperResultats(resultats, criteres.getRegroupement());
    }
    
    return resultats;
}


    private List<Map<String, Object>> recupererDialoguesScene(Long sceneId) {
        return dialogueRepository.findBySceneId(sceneId).stream()
            .map(dialogue -> {
                Map<String, Object> dialogueMap = new HashMap<>();
                dialogueMap.put("id", dialogue.getId());
                dialogueMap.put("texte", dialogue.getTexte());
                dialogueMap.put("ordre", dialogue.getOrdre());
                dialogueMap.put("observation", dialogue.getObservation());
                
                // Ajouter le nom du personnage
                if (dialogue.getPersonnage() != null) {
                    dialogueMap.put("personnageNom", dialogue.getPersonnage().getNom());
                    if (dialogue.getPersonnage().getComedien() != null) {
                        dialogueMap.put("comedienNom", dialogue.getPersonnage().getComedien().getNom());
                    }
                }
                
                return dialogueMap;
            })
            .collect(Collectors.toList());
    }
    
    public RechercheAvanceeDTO getDetailsParTypeEtId(String type, Long id) {
        // CORRECTION : Ajouter une implémentation de base avec return
        if (type == null || id == null) {
            throw new IllegalArgumentException("Type et ID ne peuvent pas être null");
        }
        
        switch (type.toLowerCase()) {
            case "personnage":
                Personnage personnage = personnageRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Personnage non trouvé avec l'ID: " + id));
                return convertirPersonnageEnDTO(personnage);
            case "scene":
                SceneTournage tournage = sceneTournageRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Scène de tournage non trouvée avec l'ID: " + id));
                return convertirSceneTournageEnDTO(tournage);
            case "lieu":
                Lieu lieu = lieuRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lieu non trouvé avec l'ID: " + id));
                return convertirLieuEnDTO(lieu);
            case "plateau":
                Plateau plateau = plateauRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Plateau non trouvé avec l'ID: " + id));
                return convertirPlateauEnDTO(plateau);
            default:
                throw new RuntimeException("Type non supporté: " + type);
        }
    }

    // NOUVELLE MÉTHODE - Détails complets par type et ID
    public Map<String, Object> getDetailsCompletsParTypeEtId(String type, Long id) {
        Map<String, Object> details = new HashMap<>();
        
        switch (type.toLowerCase()) {
            case "personnage":
                Personnage personnage = personnageRepository.findById(id).orElseThrow();
                details.put("informations", convertirPersonnageEnDTO(personnage));
                details.put("statistiques", calculerStatistiquesPersonnage(id));
                details.put("dialogues", recupererDialoguesPersonnage(id));
                details.put("scenes", recupererScenesPersonnage(id));
                details.put("planning", recupererPlanningPersonnage(id));
                details.put("informationsComplementaires", getInformationsPersonnage(id));
                break;
                
            case "scene":
                SceneTournage tournage = sceneTournageRepository.findById(id).orElseThrow();
                details.put("informations", convertirSceneTournageEnDTO(tournage));
                details.put("personnages", recupererPersonnagesScene(tournage.getScene().getId()));
                details.put("statistiques", calculerStatistiquesScene(tournage.getScene().getId()));
                details.put("dialoguesComplets", recupererDialoguesScene(tournage.getScene().getId())); // ← NOUVEAU
                details.put("informationsComplementaires", getInformationsScene(tournage.getScene().getId()));
                break;
                
            case "lieu":
                Lieu lieu = lieuRepository.findById(id).orElseThrow();
                details.put("informations", convertirLieuEnDTO(lieu));
                details.put("scenes", recupererScenesLieu(id));
                details.put("plateaux", recupererPlateauxLieu(id));
                details.put("statistiques", calculerStatistiquesLieu(id));
                details.put("informationsComplementaires", getInformationsLieu(id));
                break;
                
            case "plateau":
                Plateau plateau = plateauRepository.findById(id).orElseThrow();
                details.put("informations", convertirPlateauEnDTO(plateau));
                details.put("scenes", recupererScenesPlateau(id));
                details.put("statistiques", calculerStatistiquesPlateau(id));
                details.put("informationsComplementaires", getInformationsPlateau(id));
                break;
                
            default:
                throw new RuntimeException("Type non supporté: " + type);
        }
        
        return details;
    }
    
    // NOUVELLE MÉTHODE - Statistiques par type
    public Map<String, Object> getStatistiquesParTypeEtId(String type, Long id) {
        switch (type.toLowerCase()) {
            case "personnage":
                return calculerStatistiquesPersonnage(id);
            case "scene":
                return calculerStatistiquesScene(id);
            case "lieu":
                return calculerStatistiquesLieu(id);
            case "plateau":
                return calculerStatistiquesPlateau(id);
            default:
                throw new RuntimeException("Type non supporté: " + type);
        }
    }

    // MÉTHODES DE CALCUL DES STATISTIQUES (AMÉLIORÉES)
    private Map<String, Object> calculerStatistiquesPersonnage(Long personnageId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Dialogue> dialogues = dialogueRepository.findByPersonnageId(personnageId);
        int totalMots = dialogues.stream()
            .mapToInt(d -> d.getTexte().split(" ").length)
            .sum();
        
        int nbScenes = compterScenesPersonnage(personnageId);
        int nbDialogues = dialogues.size();
        
        // Calcul de la durée estimée (2.5 mots par seconde)
        int dureeSecondes = (int) Math.ceil(totalMots / 2.5);
        String dureeTotale = String.format("%dh %02dm", 
            dureeSecondes / 3600, 
            (dureeSecondes % 3600) / 60);
        
        stats.put("nbScenes", nbScenes);
        stats.put("nbDialogues", nbDialogues);
        stats.put("totalMots", totalMots);
        stats.put("dureeTotale", dureeTotale);
        stats.put("pourcentageDialogues", calculerPourcentageDialoguesPersonnage(personnageId));
        
        return stats;
    }
    
    private Map<String, Object> calculerStatistiquesScene(Long sceneId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Dialogue> dialogues = dialogueRepository.findBySceneId(sceneId);
        int totalMots = dialogues.stream()
            .mapToInt(d -> d.getTexte().split(" ").length)
            .sum();
        
        int nbPersonnages = personnageRepository.findPersonnagesBySceneId(sceneId).size();
        int nbDialogues = dialogues.size();
        
        // Durée estimée
        int dureeSecondes = (int) Math.ceil(totalMots / 2.5);
        String dureeEstimee = String.format("%dh %02dm", 
            dureeSecondes / 3600, 
            (dureeSecondes % 3600) / 60);
        
        stats.put("nbPersonnages", nbPersonnages);
        stats.put("nbDialogues", nbDialogues);
        stats.put("totalMots", totalMots);
        stats.put("dureeEstimee", dureeEstimee);
        
        return stats;
    }
    
    private Map<String, Object> calculerStatistiquesLieu(Long lieuId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<SceneTournage> tournages = sceneTournageRepository.findByLieuId(lieuId);
        int nbScenes = tournages.size();
        int nbPlateaux = plateauRepository.findByLieuId(lieuId).size();
        
        // Calcul des jours de tournage uniques
        long joursTournage = tournages.stream()
            .map(SceneTournage::getDateTournage)
            .filter(Objects::nonNull)
            .distinct()
            .count();
        
        stats.put("nbScenes", nbScenes);
        stats.put("nbPlateaux", nbPlateaux);
        stats.put("joursTournage", joursTournage);
        stats.put("dureeTotale", "À calculer"); // À implémenter selon vos besoins
        
        return stats;
    }
    
    private Map<String, Object> calculerStatistiquesPlateau(Long plateauId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<SceneTournage> tournages = sceneTournageRepository.findByPlateauId(plateauId);
        int nbScenes = tournages.size();
        
        Optional<Plateau> plateauOpt = plateauRepository.findById(plateauId);
        
        // CORRECTION : Ne pas utiliser getCapacite() puisque la colonne n'existe pas
        String capacite = "Non spécifiée";
        String equipements = plateauOpt.map(Plateau::getDescription).orElse("Non spécifiés");
        
        // Jours d'utilisation uniques
        long joursUtilisation = tournages.stream()
            .map(SceneTournage::getDateTournage)
            .filter(Objects::nonNull)
            .distinct()
            .count();
        
        stats.put("nbScenes", nbScenes);
        stats.put("capacite", capacite); // Toujours "Non spécifiée"
        stats.put("equipements", equipements);
        stats.put("joursUtilisation", joursUtilisation);
        
        return stats;
    }

    // NOUVELLES MÉTHODES POUR LES INFORMATIONS COMPLÉMENTAIRES
    private Map<String, Object> getInformationsPersonnage(Long personnageId) {
        Map<String, Object> infos = new HashMap<>();
        
        Personnage personnage = personnageRepository.findById(personnageId).orElseThrow();
        infos.put("age", personnage.getDescription() != null ? 
            extraireAge(personnage.getDescription()) : "Non spécifié");
        infos.put("typePersonnage", determinerTypePersonnage(personnage));
        infos.put("descriptionComplete", personnage.getDescription());
        
        return infos;
    }
    
    private Map<String, Object> getInformationsScene(Long sceneId) {
        Map<String, Object> infos = new HashMap<>();
        
        Scene scene = sceneRepository.findById(sceneId).orElseThrow();
        infos.put("synopsis", scene.getSynopsis());
        infos.put("ordre", scene.getOrdre());
        infos.put("difficulte", estimerDifficulteScene(sceneId));
        
        return infos;
    }
    
    private Map<String, Object> getInformationsLieu(Long lieuId) {
        Map<String, Object> infos = new HashMap<>();
        
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow();
        infos.put("adresse", lieu.getAdresse());
        infos.put("coordonnees", "À géolocaliser"); // À implémenter
        infos.put("capacite", "Non spécifiée");
        infos.put("equipements", "Non spécifiés");
        infos.put("type", lieu.getTypeLieu());
        
        return infos;
    }
    
    private Map<String, Object> getInformationsPlateau(Long plateauId) {
        Map<String, Object> infos = new HashMap<>();
        
        Plateau plateau = plateauRepository.findById(plateauId).orElseThrow();
        infos.put("adresse", plateau.getLieu() != null ? 
            plateau.getLieu().getAdresse() : "Non spécifiée");
        infos.put("superficie", "Non spécifiée");
        infos.put("acces", "Standard");
        infos.put("restrictions", "Aucune");
        infos.put("type", plateau.getTypePlateau());
        
        return infos;
    }

    // MÉTHODES UTILITAIRES
    private String extraireAge(String description) {
        // Logique simplifiée pour extraire l'âge de la description
        if (description == null) return "Non spécifié";
        // Implémentez votre logique d'extraction d'âge ici
        return "Adulte";
    }
    
    private String determinerTypePersonnage(Personnage personnage) {
        // Logique pour déterminer le type de personnage
        List<Dialogue> dialogues = dialogueRepository.findByPersonnageId(personnage.getId());
        int nbDialogues = dialogues.size();
        
        if (nbDialogues > 20) return "Principal";
        if (nbDialogues > 5) return "Secondaire";
        return "Figurant";
    }
    
    private String estimerDifficulteScene(Long sceneId) {
        // Logique pour estimer la difficulté d'une scène
        List<Dialogue> dialogues = dialogueRepository.findBySceneId(sceneId);
        int totalMots = dialogues.stream()
            .mapToInt(d -> d.getTexte().split(" ").length)
            .sum();
        
        if (totalMots > 500) return "Élevée";
        if (totalMots > 200) return "Moyenne";
        return "Faible";
    }
    
    private double calculerPourcentageDialoguesPersonnage(Long personnageId) {
        // CORRECTION : Remplacer countByPersonnageId par une méthode existante
        Personnage personnage = personnageRepository.findById(personnageId).orElseThrow();
        Long projetId = personnage.getProjet().getId();
        
        // Utiliser une méthode qui existe dans votre repository
        long totalDialoguesProjet = dialogueRepository.countBySceneSequenceEpisodeProjetId(projetId);
        
        // Remplacer countByPersonnageId par size() de la liste
        long dialoguesPersonnage = dialogueRepository.findByPersonnageId(personnageId).size();
        
        return totalDialoguesProjet > 0 ? 
            (dialoguesPersonnage * 100.0) / totalDialoguesProjet : 0;
    }

    // MÉTHODES DE RÉCUPÉRATION DES DONNÉES ASSOCIÉES
    private List<Map<String, Object>> recupererDialoguesPersonnage(Long personnageId) {
        return dialogueRepository.findByPersonnageId(personnageId).stream()
            .map(dialogue -> {
                Map<String, Object> dialogueMap = new HashMap<>();
                dialogueMap.put("id", dialogue.getId());
                dialogueMap.put("texte", dialogue.getTexte());
                dialogueMap.put("ordre", dialogue.getOrdre());
                dialogueMap.put("observation", dialogue.getObservation());
                
                // Informations sur la scène
                if (dialogue.getScene() != null) {
                    dialogueMap.put("sceneId", dialogue.getScene().getId());
                    dialogueMap.put("sceneTitre", dialogue.getScene().getTitre());
                    
                    if (dialogue.getScene().getSequence() != null) {
                        dialogueMap.put("sequenceTitre", dialogue.getScene().getSequence().getTitre());
                        
                        if (dialogue.getScene().getSequence().getEpisode() != null) {
                            dialogueMap.put("episodeTitre", dialogue.getScene().getSequence().getEpisode().getTitre());
                        }
                    }
                }
                
                return dialogueMap;
            })
            .collect(Collectors.toList());
    }

    private int compterScenesPersonnage(Long personnageId) {
        // Compter le nombre de scènes distinctes où le personnage parle
        return dialogueRepository.findByPersonnageId(personnageId).stream()
            .map(dialogue -> dialogue.getScene().getId())
            .distinct()
            .collect(Collectors.toList())
            .size();
    }
    
    private List<Map<String, Object>> recupererScenesPersonnage(Long personnageId) {
        List<Dialogue> dialogues = dialogueRepository.findByPersonnageId(personnageId);
        
        // Grouper par scène
        Map<Scene, List<Dialogue>> scenesAvecDialogues = dialogues.stream()
            .collect(Collectors.groupingBy(Dialogue::getScene));
        
        return scenesAvecDialogues.entrySet().stream()
            .map(entry -> {
                Scene scene = entry.getKey();
                List<Dialogue> dialoguesScene = entry.getValue();
                
                Map<String, Object> sceneMap = new HashMap<>();
                sceneMap.put("id", scene.getId());
                sceneMap.put("titre", scene.getTitre());
                sceneMap.put("nbDialogues", dialoguesScene.size());
                
                // RÉCUPÉRATION COMPLÈTE DU PLANNING
                Optional<SceneTournage> tournage = sceneTournageRepository.findBySceneId(scene.getId());
                if (tournage.isPresent()) {
                    SceneTournage st = tournage.get();
                    sceneMap.put("statut", st.getStatutTournage());
                    sceneMap.put("dateTournage", st.getDateTournage());
                    
                    // AJOUT DES HEURES
                    if (st.getHeureDebut() != null) {
                        sceneMap.put("heureDebut", st.getHeureDebut().toString());
                    }
                    if (st.getHeureFin() != null) {
                        sceneMap.put("heureFin", st.getHeureFin().toString());
                    }
                    
                    // AJOUT DES LIEUX ET PLATEAUX
                    if (st.getLieu() != null) {
                        sceneMap.put("lieuNom", st.getLieu().getNomLieu());
                    }
                    if (st.getPlateau() != null) {
                        sceneMap.put("plateauNom", st.getPlateau().getNom());
                    }
                } else {
                    // Valeurs par défaut si pas de planning
                    sceneMap.put("statut", "planifie");
                    sceneMap.put("heureDebut", null);
                    sceneMap.put("heureFin", null);
                    sceneMap.put("lieuNom", null);
                    sceneMap.put("plateauNom", null);
                }
                
                return sceneMap;
            })
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> recupererPlanningPersonnage(Long personnageId) {
        List<Map<String, Object>> planning = new ArrayList<>();
        
        // Récupérer toutes les scènes où le personnage apparaît
        List<Dialogue> dialogues = dialogueRepository.findByPersonnageId(personnageId);
        Set<Long> sceneIds = dialogues.stream()
            .map(dialogue -> dialogue.getScene().getId())
            .collect(Collectors.toSet());
        
        // Récupérer le planning pour ces scènes
        for (Long sceneId : sceneIds) {
            Optional<SceneTournage> tournage = sceneTournageRepository.findBySceneId(sceneId);
            if (tournage.isPresent()) {
                SceneTournage st = tournage.get();
                Map<String, Object> plan = new HashMap<>();
                plan.put("id", st.getId());
                plan.put("dateTournage", st.getDateTournage());
                
                // CORRECTION : Récupérer les heures
                if (st.getHeureDebut() != null) {
                    plan.put("heureDebut", st.getHeureDebut().toString());
                }
                if (st.getHeureFin() != null) {
                    plan.put("heureFin", st.getHeureFin().toString());
                }
                
                plan.put("sceneTitre", st.getScene().getTitre());
                plan.put("lieuNom", st.getLieu() != null ? st.getLieu().getNomLieu() : null);
                plan.put("plateauNom", st.getPlateau() != null ? st.getPlateau().getNom() : null);
                plan.put("statut", st.getStatutTournage());
                
                planning.add(plan);
            }
        }
        
        return planning;
    }
    
    private List<Map<String, Object>> recupererPersonnagesScene(Long sceneId) {
        List<Dialogue> dialogues = dialogueRepository.findBySceneId(sceneId);
        
        // Grouper par personnage
        Map<Personnage, List<Dialogue>> personnagesAvecDialogues = dialogues.stream()
            .filter(d -> d.getPersonnage() != null)
            .collect(Collectors.groupingBy(Dialogue::getPersonnage));
        
        return personnagesAvecDialogues.entrySet().stream()
            .map(entry -> {
                Personnage personnage = entry.getKey();
                List<Dialogue> dialoguesPersonnage = entry.getValue();
                
                Map<String, Object> personnageMap = new HashMap<>();
                personnageMap.put("id", personnage.getId());
                personnageMap.put("nom", personnage.getNom());
                personnageMap.put("comedien", personnage.getComedien() != null ? personnage.getComedien().getNom() : null);
                personnageMap.put("nbDialogues", dialoguesPersonnage.size());
                
                return personnageMap;
            })
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> recupererScenesLieu(Long lieuId) {
        List<SceneTournage> tournages = sceneTournageRepository.findByLieuId(lieuId);
        
        return tournages.stream()
            .map(tournage -> {
                Map<String, Object> sceneMap = new HashMap<>();
                sceneMap.put("id", tournage.getScene().getId());
                sceneMap.put("titre", tournage.getScene().getTitre());
                sceneMap.put("dateTournage", tournage.getDateTournage());
                sceneMap.put("heureDebut", tournage.getHeureDebut() != null ? tournage.getHeureDebut().toString() : null);
                sceneMap.put("heureFin", tournage.getHeureFin() != null ? tournage.getHeureFin().toString() : null);
                sceneMap.put("statut", tournage.getStatutTournage());
                
                // Compter le nombre de personnages dans la scène
                List<Personnage> personnages = personnageRepository.findPersonnagesBySceneId(tournage.getScene().getId());
                sceneMap.put("nbPersonnages", personnages.size());
                
                return sceneMap;
            })
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> recupererPlateauxLieu(Long lieuId) {
        List<Plateau> plateaux = plateauRepository.findByLieuId(lieuId);
        
        return plateaux.stream()
            .map(plateau -> {
                Map<String, Object> plateauMap = new HashMap<>();
                plateauMap.put("id", plateau.getId());
                plateauMap.put("nom", plateau.getNom());
                plateauMap.put("type", plateau.getTypePlateau());
                
                // Compter le nombre de scènes sur ce plateau
                List<SceneTournage> tournages = sceneTournageRepository.findByPlateauId(plateau.getId());
                plateauMap.put("nbScenes", tournages.size());
                
                return plateauMap;
            })
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> recupererScenesPlateau(Long plateauId) {
        List<SceneTournage> tournages = sceneTournageRepository.findByPlateauId(plateauId);
        
        return tournages.stream()
            .map(tournage -> {
                Map<String, Object> sceneMap = new HashMap<>();
                sceneMap.put("id", tournage.getScene().getId());
                sceneMap.put("titre", tournage.getScene().getTitre());
                sceneMap.put("dateTournage", tournage.getDateTournage());
                sceneMap.put("heureDebut", tournage.getHeureDebut() != null ? tournage.getHeureDebut().toString() : null);
                sceneMap.put("heureFin", tournage.getHeureFin() != null ? tournage.getHeureFin().toString() : null);
                sceneMap.put("statut", tournage.getStatutTournage());
                
                // Compter le nombre de dialogues dans la scène
                List<Dialogue> dialogues = dialogueRepository.findBySceneId(tournage.getScene().getId());
                sceneMap.put("nbDialogues", dialogues.size());
                
                return sceneMap;
            })
            .collect(Collectors.toList());
    }
    
    // Les méthodes existantes de recherche et conversion restent inchangées
    private List<RechercheAvanceeDTO> rechercherScenes(CritereRechercheDTO criteres) {
        return sceneTournageRepository.findByDateTournageBetween(
                criteres.getDateDebut() != null ? criteres.getDateDebut() : LocalDate.of(1900, 1, 1),
                criteres.getDateFin() != null ? criteres.getDateFin() : LocalDate.now().plusYears(10))
            .stream()
            .filter(tournage -> filtreParTermeEtStatut(tournage, criteres))
            .map(this::convertirSceneTournageEnDTO)
            .collect(Collectors.toList());
    }
    
    private List<RechercheAvanceeDTO> rechercherPersonnages(CritereRechercheDTO criteres) {
        String terme = criteres.getTermeRecherche() != null ? 
            criteres.getTermeRecherche().toLowerCase() : "";
        
        return personnageRepository.findAll().stream()
            .filter(personnage -> 
                personnage.getNom().toLowerCase().contains(terme) ||
                (personnage.getDescription() != null && 
                 personnage.getDescription().toLowerCase().contains(terme)) ||
                (personnage.getComedien() != null && 
                 personnage.getComedien().getNom().toLowerCase().contains(terme)))
            .map(this::convertirPersonnageEnDTO)
            .collect(Collectors.toList());
    }
    
    private List<RechercheAvanceeDTO> rechercherLieux(CritereRechercheDTO criteres) {
        String terme = criteres.getTermeRecherche() != null ? 
            criteres.getTermeRecherche().toLowerCase() : "";
        
        return lieuRepository.findAll().stream()
            .filter(lieu -> 
                lieu.getNomLieu().toLowerCase().contains(terme) ||
                (lieu.getAdresse() != null && 
                 lieu.getAdresse().toLowerCase().contains(terme)) ||
                lieu.getTypeLieu().toLowerCase().contains(terme))
            .map(this::convertirLieuEnDTO)
            .collect(Collectors.toList());
    }
    
    private List<RechercheAvanceeDTO> rechercherPlateaux(CritereRechercheDTO criteres) {
        String terme = criteres.getTermeRecherche() != null ? 
            criteres.getTermeRecherche().toLowerCase() : "";
        
        return plateauRepository.findAll().stream()
            .filter(plateau -> 
                plateau.getNom().toLowerCase().contains(terme) ||
                (plateau.getDescription() != null && 
                 plateau.getDescription().toLowerCase().contains(terme)) ||
                plateau.getTypePlateau().toLowerCase().contains(terme) ||
                (plateau.getLieu() != null && 
                 plateau.getLieu().getNomLieu().toLowerCase().contains(terme)))
            .map(this::convertirPlateauEnDTO)
            .collect(Collectors.toList());
    }
    
    private boolean filtreParTermeEtStatut(SceneTournage tournage, CritereRechercheDTO criteres) {
        String terme = criteres.getTermeRecherche() != null ? 
            criteres.getTermeRecherche().toLowerCase() : "";
        
        boolean matchesTerme = terme.isEmpty() ||
            tournage.getScene().getTitre().toLowerCase().contains(terme) ||
            (tournage.getScene().getSynopsis() != null && 
             tournage.getScene().getSynopsis().toLowerCase().contains(terme)) ||
            (tournage.getLieu() != null && 
             tournage.getLieu().getNomLieu().toLowerCase().contains(terme)) ||
            (tournage.getPlateau() != null && 
             tournage.getPlateau().getNom().toLowerCase().contains(terme));
        
        boolean matchesStatut = criteres.getStatuts() == null || 
            criteres.getStatuts().isEmpty() ||
            criteres.getStatuts().contains(tournage.getStatutTournage());
        
        return matchesTerme && matchesStatut;
    }
    
    private List<RechercheAvanceeDTO> regrouperResultats(List<RechercheAvanceeDTO> resultats, String regroupement) {
        Map<String, List<RechercheAvanceeDTO>> groupes = new HashMap<>();
        
        for (RechercheAvanceeDTO resultat : resultats) {
            String cleGroupe = obtenirCleGroupe(resultat, regroupement);
            groupes.computeIfAbsent(cleGroupe, k -> new ArrayList<>()).add(resultat);
        }
        
        List<RechercheAvanceeDTO> resultatsGroupes = new ArrayList<>();
        for (Map.Entry<String, List<RechercheAvanceeDTO>> entry : groupes.entrySet()) {
            RechercheAvanceeDTO enTeteGroupe = new RechercheAvanceeDTO();
            enTeteGroupe.setType("groupe");
            enTeteGroupe.setGroupeKey(regroupement);
            enTeteGroupe.setGroupeValeur(entry.getKey());
            enTeteGroupe.setTitre("Groupe: " + entry.getKey());
            resultatsGroupes.add(enTeteGroupe);
            
            resultatsGroupes.addAll(entry.getValue());
        }
        
        return resultatsGroupes;
    }
    
    private String obtenirCleGroupe(RechercheAvanceeDTO resultat, String regroupement) {
        switch (regroupement.toLowerCase()) {
            case "plateau":
                return resultat.getPlateauNom() != null ? resultat.getPlateauNom() : "Non spécifié";
            case "lieu":
                return resultat.getLieuNom() != null ? resultat.getLieuNom() : "Non spécifié";
            case "personnage":
                return resultat.getPersonnageNom() != null ? resultat.getPersonnageNom() : "Non spécifié";
            case "statut":
                return resultat.getStatut() != null ? resultat.getStatut() : "Non spécifié";
            default:
                return "Autre";
        }
    }
    
    // Méthodes de conversion existantes
    private RechercheAvanceeDTO convertirSceneTournageEnDTO(SceneTournage tournage) {
        RechercheAvanceeDTO dto = new RechercheAvanceeDTO();
        dto.setId(tournage.getId());
        dto.setType("scene");
        dto.setTitre(tournage.getScene().getTitre());
        dto.setDescription(tournage.getScene().getSynopsis());
        dto.setDateTournage(tournage.getDateTournage());
        
        if (tournage.getHeureDebut() != null) {
            dto.setHeureDebut(tournage.getHeureDebut().toString());
        }
        if (tournage.getHeureFin() != null) {
            dto.setHeureFin(tournage.getHeureFin().toString());
        }
        
        dto.setStatut(tournage.getStatutTournage());
        
        if (tournage.getLieu() != null) {
            dto.setLieuNom(tournage.getLieu().getNomLieu());
        }
        
        if (tournage.getPlateau() != null) {
            dto.setPlateauNom(tournage.getPlateau().getNom());
        }
        
        List<Personnage> personnages = personnageRepository.findPersonnagesBySceneId(tournage.getScene().getId());
        if (!personnages.isEmpty()) {
            dto.setPersonnageNom(personnages.get(0).getNom());
            if (personnages.get(0).getComedien() != null) {
                dto.setComedienNom(personnages.get(0).getComedien().getNom());
            }
        }
        
        List<String> dialogues = dialogueRepository.findBySceneId(tournage.getScene().getId())
            .stream()
            .map(Dialogue::getTexte)
            .collect(Collectors.toList());
        dto.setDialogues(dialogues);
        
        if (tournage.getScene().getSequence() != null) {
            dto.setSequenceTitre(tournage.getScene().getSequence().getTitre());
            if (tournage.getScene().getSequence().getEpisode() != null) {
                dto.setEpisodeTitre(tournage.getScene().getSequence().getEpisode().getTitre());
                if (tournage.getScene().getSequence().getEpisode().getProjet() != null) {
                    dto.setProjetTitre(tournage.getScene().getSequence().getEpisode().getProjet().getTitre());
                }
            }
        }
        
        dto.setModifieLe(tournage.getModifieLe());
        
        return dto;
    }
    
    private RechercheAvanceeDTO convertirPersonnageEnDTO(Personnage personnage) {
        RechercheAvanceeDTO dto = new RechercheAvanceeDTO();
        dto.setId(personnage.getId());
        dto.setType("personnage");
        dto.setTitre(personnage.getNom());
        dto.setDescription(personnage.getDescription());
        dto.setPersonnageNom(personnage.getNom());
        
        if (personnage.getComedien() != null) {
            dto.setComedienNom(personnage.getComedien().getNom());
        }
        
        if (personnage.getProjet() != null) {
            dto.setProjetTitre(personnage.getProjet().getTitre());
        }
        
        // RÉCUPÉRATION DES VRAIS DIALOGUES DU PERSONNAGE
        List<String> dialogues = dialogueRepository.findByPersonnageId(personnage.getId())
            .stream()
            .map(Dialogue::getTexte)
            .collect(Collectors.toList());
        dto.setDialogues(dialogues);
        
        dto.setModifieLe(personnage.getModifieLe());
        
        return dto;
    }
    
    private RechercheAvanceeDTO convertirLieuEnDTO(Lieu lieu) {
        RechercheAvanceeDTO dto = new RechercheAvanceeDTO();
        dto.setId(lieu.getId());
        dto.setType("lieu");
        dto.setTitre(lieu.getNomLieu());
        dto.setDescription(lieu.getTypeLieu() + " - " + (lieu.getAdresse() != null ? lieu.getAdresse() : ""));
        dto.setLieuNom(lieu.getNomLieu());
        
        if (lieu.getProjet() != null) {
            dto.setProjetTitre(lieu.getProjet().getTitre());
        }
        
        dto.setModifieLe(lieu.getModifieLe());
        
        return dto;
    }
    
    private RechercheAvanceeDTO convertirPlateauEnDTO(Plateau plateau) {
        RechercheAvanceeDTO dto = new RechercheAvanceeDTO();
        dto.setId(plateau.getId());
        dto.setType("plateau");
        dto.setTitre(plateau.getNom());
        dto.setDescription(plateau.getTypePlateau() + " - " + (plateau.getDescription() != null ? plateau.getDescription() : ""));
        dto.setPlateauNom(plateau.getNom());
        
        if (plateau.getLieu() != null) {
            dto.setLieuNom(plateau.getLieu().getNomLieu());
        }
        
        dto.setModifieLe(plateau.getModifieLe());
        
        return dto;
    }
}


package com.example.films.service;

import com.example.films.dto.ScenaristeDTO;
import com.example.films.entity.EpisodeScenariste;
import com.example.films.entity.Scene;
import com.example.films.entity.Scenariste;
import com.example.films.repository.EpisodeScenaristeRepository;
import com.example.films.repository.SceneRepository;
import com.example.films.repository.ScenaristeRepository;
import com.example.films.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScenaristeService {
    
    private final ScenaristeRepository scenaristeRepository;
    private final EpisodeScenaristeRepository episodeScenaristeRepository;
    private final SceneRepository sceneRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public ScenaristeService(ScenaristeRepository scenaristeRepository,
                             EpisodeScenaristeRepository episodeScenaristeRepository,
                             SceneRepository sceneRepository,
                             UtilisateurRepository utilisateurRepository) {
        this.scenaristeRepository = scenaristeRepository;
        this.episodeScenaristeRepository = episodeScenaristeRepository;
        this.sceneRepository = sceneRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    public List<ScenaristeDTO> getAllScenaristes() {
        List<Scenariste> scenaristes = scenaristeRepository.findAllWithUtilisateur();
        return scenaristes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère tous les IDs des épisodes associés à un scénariste
     */
    private List<Long> getEpisodeIdsByScenaristeId(Long scenaristeId) {
        List<EpisodeScenariste> episodesScenariste = episodeScenaristeRepository.findByScenaristeId(scenaristeId);
        return episodesScenariste.stream()
                .map(es -> es.getEpisode().getId())
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère toutes les scènes des épisodes d'un scénariste
     */
    private List<Scene> getAllScenesByScenaristeId(Long scenaristeId) {
        List<Long> episodeIds = getEpisodeIdsByScenaristeId(scenaristeId);
        List<Scene> allScenes = new ArrayList<>();
        
        for (Long episodeId : episodeIds) {
            List<Scene> scenes = sceneRepository.findByEpisodeId(episodeId);
            allScenes.addAll(scenes);
        }
        
        return allScenes;
    }
    
    /**
     * Récupère les statistiques de productivité pour un utilisateur
     */
    public Map<String, Object> getProductiviteStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 1. Récupérer le scénariste à partir de l'ID utilisateur
            Optional<Scenariste> scenaristeOpt = scenaristeRepository.findByUtilisateurId(userId);
            if (scenaristeOpt.isEmpty()) {
                return getDefaultProductiviteStats();
            }
            
            Long scenaristeId = scenaristeOpt.get().getId();
            
            // 2. Récupérer toutes les scènes du scénariste
            List<Scene> allScenes = getAllScenesByScenaristeId(scenaristeId);
            
            if (allScenes.isEmpty()) {
                return getDefaultProductiviteStats();
            }
            
            // 3. Compter les scènes modifiées dans les 7 derniers jours
            LocalDateTime oneWeekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
            LocalDateTime twoWeeksAgo = LocalDateTime.now().minus(14, ChronoUnit.DAYS);
            
            int scenesModifiees7j = 0;
            int scenesSemainePrecedente = 0;
            
            for (Scene scene : allScenes) {
                LocalDateTime modifieLe = scene.getModifieLe();
                if (modifieLe != null) {
                    if (modifieLe.isAfter(oneWeekAgo)) {
                        scenesModifiees7j++;
                    }
                    if (modifieLe.isAfter(twoWeeksAgo) && modifieLe.isBefore(oneWeekAgo)) {
                        scenesSemainePrecedente++;
                    }
                }
            }
            
            // 4. Calculer la tendance
            int tendanceScenes = 0;
            if (scenesSemainePrecedente > 0) {
                tendanceScenes = (int) Math.round(((double) scenesModifiees7j - scenesSemainePrecedente) / scenesSemainePrecedente * 100);
            } else if (scenesModifiees7j > 0) {
                tendanceScenes = 100;
            }
            
            // 5. Calculer la productivité (basée sur un objectif de 5 scènes par semaine)
            int productivite = Math.min(100, (int) Math.round((double) scenesModifiees7j / 5 * 100));
            
            // 6. Temps total d'écriture estimé (30 min par scène modifiée)
            int tempsTotalMinutes = scenesModifiees7j * 30;
            
            // 7. Moyenne quotidienne
            int moyenneQuotidienneMinutes = tempsTotalMinutes / 7;
            
            stats.put("productivite", productivite);
            stats.put("scenesModifiees7j", scenesModifiees7j);
            stats.put("tendanceScenes", tendanceScenes);
            stats.put("tempsTotalMinutes", tempsTotalMinutes);
            stats.put("moyenneQuotidienneMinutes", moyenneQuotidienneMinutes);
            stats.put("sessionMoyenneMinutes", 45);
            
        } catch (Exception e) {
            System.err.println("Erreur lors du calcul des stats de productivité: " + e.getMessage());
            return getDefaultProductiviteStats();
        }
        
        return stats;
    }
    
    /**
     * Statistiques de productivité par défaut
     */
    private Map<String, Object> getDefaultProductiviteStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("productivite", 0);
        stats.put("scenesModifiees7j", 0);
        stats.put("tendanceScenes", 0);
        stats.put("tempsTotalMinutes", 0);
        stats.put("moyenneQuotidienneMinutes", 0);
        stats.put("sessionMoyenneMinutes", 45);
        return stats;
    }
    
    /**
     * Récupère les activités récentes d'un utilisateur
     */
    public List<Map<String, Object>> getRecentActivities(Long userId, int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        try {
            // Récupérer le scénariste
            Optional<Scenariste> scenaristeOpt = scenaristeRepository.findByUtilisateurId(userId);
            if (scenaristeOpt.isEmpty()) {
                return getExampleActivities();
            }
            
            Long scenaristeId = scenaristeOpt.get().getId();
            
            // Récupérer toutes les scènes du scénariste
            List<Scene> allScenes = getAllScenesByScenaristeId(scenaristeId);
            
            if (allScenes.isEmpty()) {
                return getExampleActivities();
            }
            
            // Trier par date de modification (plus récente d'abord)
            allScenes.sort((s1, s2) -> {
                if (s1.getModifieLe() == null && s2.getModifieLe() == null) return 0;
                if (s1.getModifieLe() == null) return 1;
                if (s2.getModifieLe() == null) return -1;
                return s2.getModifieLe().compareTo(s1.getModifieLe());
            });
            
            // Limiter au nombre demandé
            int maxActivities = Math.min(limit, allScenes.size());
            for (int i = 0; i < maxActivities; i++) {
                Scene scene = allScenes.get(i);
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "scene_" + scene.getId());
                activity.put("type", "scene_modified");
                activity.put("description", "Scène \"" + truncateString(scene.getTitre(), 40) + "\" modifiée");
                activity.put("date", scene.getModifieLe() != null ? scene.getModifieLe().toString() : LocalDateTime.now().toString());
                
                // Récupérer les infos du projet
                if (scene.getSequence() != null && scene.getSequence().getEpisode() != null 
                        && scene.getSequence().getEpisode().getProjet() != null) {
                    activity.put("projetId", scene.getSequence().getEpisode().getProjet().getId());
                    activity.put("projetTitre", scene.getSequence().getEpisode().getProjet().getTitre());
                } else {
                    activity.put("projetId", null);
                    activity.put("projetTitre", "Projet inconnu");
                }
                
                activities.add(activity);
            }
            
            // Si pas assez d'activités, compléter avec des exemples
            if (activities.size() < limit) {
                List<Map<String, Object>> examples = getExampleActivities();
                int needed = limit - activities.size();
                activities.addAll(examples.subList(0, Math.min(needed, examples.size())));
            }
            
        } catch (Exception e) {
            System.err.println("Erreur lors du chargement des activités: " + e.getMessage());
            return getExampleActivities();
        }
        
        return activities;
    }
    
    /**
     * Exemples d'activités pour démonstration
     */
    private List<Map<String, Object>> getExampleActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        String[] exemplesTypes = {
            "scene_modified",
            "dialogue_created",
            "scene_created",
            "status_changed",
            "scene_modified"
        };
        
        String[] exemplesDesc = {
            "Scène \"Le Rendez-vous\" modifiée",
            "Dialogue créé dans \"Scène d'ouverture\"",
            "Nouvelle scène \"Rencontre\" créée",
            "Statut du projet mis à jour",
            "Scène \"Flashback\" modifiée"
        };
        
        for (int i = 0; i < exemplesTypes.length; i++) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", "example_" + i);
            activity.put("type", exemplesTypes[i]);
            activity.put("description", exemplesDesc[i]);
            activity.put("date", LocalDateTime.now().minus(i * 2, ChronoUnit.HOURS).toString());
            activity.put("projetId", 1);
            activity.put("projetTitre", "Projet Démo");
            activities.add(activity);
        }
        
        return activities;
    }
    
    /**
     * Tronque une chaîne à une longueur maximale
     */
    private String truncateString(String str, int maxLength) {
        if (str == null) return "";
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength - 3) + "...";
    }
    
    private ScenaristeDTO convertToDTO(Scenariste scenariste) {
        ScenaristeDTO dto = new ScenaristeDTO();
        dto.setIdScenariste(scenariste.getId());
        dto.setIdUtilisateur(scenariste.getUtilisateur().getId());
        dto.setNom(scenariste.getUtilisateur().getNom());
        dto.setEmail(scenariste.getUtilisateur().getEmail());
        dto.setSpecialite(scenariste.getSpecialite());
        dto.setBiographie(scenariste.getBiographie());
        return dto;
    }
}


// ScenaristeStatisticsService.java
package com.example.films.service;

import com.example.films.dto.ScenaristeStatisticsDTO;
import com.example.films.dto.ObjectifsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScenaristeStatisticsService {
    
    private final JdbcTemplate jdbcTemplate;
    
    public ScenaristeStatisticsDTO getStatisticsPersonnelles(Long userId) {
        log.info("Calcul des statistiques personnelles pour l'utilisateur: {}", userId);
        
        ScenaristeStatisticsDTO stats = new ScenaristeStatisticsDTO();
        stats.setUserId(userId);
        stats.setDateCalcul(LocalDateTime.now());
        
        try {
            // 1. Vérifier si l'utilisateur est associé à des épisodes
            if (!isScenaristeAssocieAProjets(userId)) {
                log.warn("Utilisateur {} n'est associé à aucun projet ou épisode", userId);
                return stats;
            }
            
            // 2. Récupérer les informations de base de l'utilisateur
            Map<String, Object> userInfo = getUserInfo(userId);
            stats.setNom((String) userInfo.get("nom"));
            stats.setEmail((String) userInfo.get("email"));
            
            // 3. Calculer la productivité (semaine en cours)
            Double productivite = calculateProductivite(userId);
            stats.setProductivite(productivite);
            
            // 4. Nombre de scènes modifiées cette semaine
            Integer scenesModifiees = getScenesModifiees7Jours(userId);
            stats.setScenesModifiees7j(scenesModifiees);
            
            // 5. Tendance vs semaine précédente
            Integer tendance = calculateTendanceScenes(userId);
            stats.setTendanceScenes(tendance);
            
            // 6. Temps total et moyennes (utilisation estimée)
            Map<String, Integer> tempsStats = calculateTempsUtilisation(userId);
            stats.setTempsTotalMinutes(tempsStats.get("total"));
            stats.setMoyenneQuotidienneMinutes(tempsStats.get("moyenneQuotidienne"));
            stats.setSessionMoyenneMinutes(tempsStats.get("sessionMoyenne"));
            stats.setHeuresProductives(tempsStats.get("heuresProductives"));
            
            // 7. Objectifs
            ObjectifsDTO objectifs = calculateObjectifs(userId);
            stats.setObjectifs(objectifs);
            
            // 8. Activités par jour
            Map<String, Integer> activitesParJour = getActivitesParJour(userId);
            stats.setActivitesParJour(activitesParJour);
            
            // 9. Dernier accès
            LocalDateTime dernierAcces = getDernierAcces(userId);
            stats.setDernierAcces(dernierAcces);
            
            // 10. Jours actifs ce mois
            Integer joursActifs = getJoursActifs(userId);
            stats.setJoursActifs(joursActifs);
            
            log.info("Statistiques calculées avec succès pour l'utilisateur: {}", userId);
            return stats;
            
        } catch (Exception e) {
            log.error("Erreur lors du calcul des statistiques personnelles", e);
            throw e;
        }
    }
    
    private boolean isScenaristeAssocieAProjets(Long userId) {
        String sql = """
            SELECT COUNT(*) as count 
            FROM scenaristes s
            JOIN episode_scenaristes es ON s.id_scenariste = es.id_scenariste
            WHERE s.id_utilisateur = ?
            """;
        
        Long count = jdbcTemplate.queryForObject(sql, Long.class, userId);
        return count != null && count > 0;
    }
    
    private Map<String, Object> getUserInfo(Long userId) {
        String sql = """
            SELECT nom, email, role
            FROM utilisateurs 
            WHERE id_utilisateur = ?
            """;
        
        return jdbcTemplate.queryForMap(sql, userId);
    }
    
    private Double calculateProductivite(Long userId) {
        LocalDate debutSemaine = LocalDate.now().minusDays(7);
        
        String sql = """
            SELECT 
                COUNT(DISTINCT s.id_scene) as scenes_modifiees,
                COUNT(DISTINCT d.id_dialogue) as dialogues_modifies
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            LEFT JOIN dialogues d ON s.id_scene = d.id_scene
            WHERE scena.id_utilisateur = ? 
              AND (s.modifie_le >= ? OR (d.modifie_le IS NOT NULL AND d.modifie_le >= ?))
            """;
        
        Map<String, Object> result = jdbcTemplate.queryForMap(sql, 
            userId, debutSemaine, debutSemaine);
        
        Long scenesModifiees = (Long) result.get("scenes_modifiees");
        Long dialoguesModifies = (Long) result.get("dialogues_modifies");
        
        // Objectif théorique: 10 scènes par semaine pour un scénariste
        double objectifTheorique = 10.0;
        double productivite = (scenesModifiees.doubleValue() / objectifTheorique) * 100;
        
        // Limiter entre 0 et 100%
        return Math.min(100.0, Math.max(0.0, productivite));
    }
    
    private Integer getScenesModifiees7Jours(Long userId) {
        LocalDate dateLimite = LocalDate.now().minusDays(7);
        
        String sql = """
            SELECT COUNT(DISTINCT s.id_scene) as total
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            WHERE scena.id_utilisateur = ? 
              AND s.modifie_le >= ?
            """;
        
        Long result = jdbcTemplate.queryForObject(sql, Long.class, userId, dateLimite);
        return result != null ? result.intValue() : 0;
    }
    
    private Integer calculateTendanceScenes(Long userId) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debutCetteSemaine = aujourdhui.minusDays(7);
        LocalDate debutSemainePassee = debutCetteSemaine.minusDays(7);
        
        String sql = """
            SELECT COUNT(DISTINCT s.id_scene) as count
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            WHERE scena.id_utilisateur = ? 
              AND s.modifie_le >= ? 
              AND s.modifie_le < ?
            """;
        
        Long cetteSemaine = jdbcTemplate.queryForObject(sql, Long.class, 
            userId, debutCetteSemaine, aujourdhui);
        
        Long semainePassee = jdbcTemplate.queryForObject(sql, Long.class, 
            userId, debutSemainePassee, debutCetteSemaine);
        
        if (semainePassee == null || semainePassee == 0) {
            return 0;
        }
        
        if (cetteSemaine == null || cetteSemaine == 0) {
            return -100;
        }
        
        double variation = ((cetteSemaine.doubleValue() - semainePassee.doubleValue()) 
                          / semainePassee.doubleValue()) * 100;
        return (int) Math.round(variation);
    }
    
    private Map<String, Integer> calculateTempsUtilisation(Long userId) {
        LocalDate debutMois = LocalDate.now().withDayOfMonth(1);
        
        // Calcul réel depuis suivi_ecriture
        String sqlReal = """
            SELECT 
                COUNT(DISTINCT date_session) as jours_actifs,
                SUM(duree_minutes) as total_minutes,
                AVG(duree_minutes) as session_moyenne
            FROM suivi_ecriture
            WHERE id_utilisateur = ? 
            AND date_session >= ?
        """;
        
        Map<String, Object> result = jdbcTemplate.queryForMap(sqlReal, userId, debutMois);
        
        Long joursActifs = (Long) result.getOrDefault("jours_actifs", 0L);
        Long totalMinutes = (Long) result.getOrDefault("total_minutes", 0L);
        Long sessionMoyenne = (Long) result.getOrDefault("session_moyenne", 0L);
        
        int jours = joursActifs.intValue() > 0 ? joursActifs.intValue() : 1;
        int moyenneQuotidienne = (int) (totalMinutes / jours);
        int heuresProductives = (int) Math.ceil(totalMinutes / 60.0);
        
        Map<String, Integer> tempsStats = new HashMap<>();
        tempsStats.put("total", totalMinutes.intValue());
        tempsStats.put("moyenneQuotidienne", moyenneQuotidienne);
        tempsStats.put("sessionMoyenne", sessionMoyenne.intValue());
        tempsStats.put("heuresProductives", heuresProductives);
        
        log.info("Temps réel calculé pour user {}: total={}, joursActifs={}", userId, totalMinutes, joursActifs);
        return tempsStats;
    }
    
    private ObjectifsDTO calculateObjectifs(Long userId) {
        ObjectifsDTO objectifs = new ObjectifsDTO();
        
        // Objectifs par défaut
        objectifs.setScenesCibles(10);
        objectifs.setDialoguesCibles(50);
        
        // Scènes complétées (statut "validee")
        String sqlScenes = """
            SELECT COUNT(DISTINCT s.id_scene) as scenes_terminees
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            LEFT JOIN scene_statuts ss ON s.id_scene = ss.id_scene AND ss.date_fin IS NULL
            LEFT JOIN statuts_scene sts ON ss.id_statut = sts.id_statut_scene
            WHERE scena.id_utilisateur = ? 
              AND sts.code = 'validee'
            """;
        
        Long scenesTerminees = jdbcTemplate.queryForObject(sqlScenes, Long.class, userId);
        objectifs.setScenesCompletees(scenesTerminees != null ? scenesTerminees.intValue() : 0);
        
        // Dialogues écrits
        String sqlDialogues = """
            SELECT COUNT(DISTINCT d.id_dialogue) as dialogues_ecrits
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            JOIN dialogues d ON s.id_scene = d.id_scene
            WHERE scena.id_utilisateur = ?
            """;
        
        Long dialoguesEcrits = jdbcTemplate.queryForObject(sqlDialogues, Long.class, userId);
        objectifs.setDialoguesEcrits(dialoguesEcrits != null ? dialoguesEcrits.intValue() : 0);
        
        // Calcul des pourcentages
        if (objectifs.getScenesCibles() > 0) {
            double progressionScenes = (objectifs.getScenesCompletees() * 100.0) / objectifs.getScenesCibles();
            objectifs.setProgressionScenes(Math.round(progressionScenes * 10.0) / 10.0);
        } else {
            objectifs.setProgressionScenes(0.0);
        }
        
        if (objectifs.getDialoguesCibles() > 0) {
            double progressionDialogues = (objectifs.getDialoguesEcrits() * 100.0) / objectifs.getDialoguesCibles();
            objectifs.setProgressionDialogues(Math.round(progressionDialogues * 10.0) / 10.0);
        } else {
            objectifs.setProgressionDialogues(0.0);
        }
        
        return objectifs;
    }
    
    private Map<String, Integer> getActivitesParJour(Long userId) {
        Map<String, Integer> activites = new HashMap<>();
        
        String sql = """
            SELECT 
                EXTRACT(DOW FROM s.modifie_le) as jour_semaine,
                COUNT(DISTINCT s.id_scene) as activites
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            WHERE scena.id_utilisateur = ? 
              AND s.modifie_le >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY EXTRACT(DOW FROM s.modifie_le)
            ORDER BY jour_semaine
            """;
        
        jdbcTemplate.query(sql, new Object[]{userId}, rs -> {
            int jour = rs.getInt("jour_semaine");
            int count = rs.getInt("activites");
            
            // Convertir le numéro du jour en nom français
            String[] joursFr = {"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"};
            if (jour >= 0 && jour < joursFr.length) {
                activites.put(joursFr[jour], count);
            }
        });
        
        return activites;
    }
    
    private LocalDateTime getDernierAcces(Long userId) {
        String sql = """
            SELECT COALESCE(
                (SELECT MAX(modifie_le) 
                 FROM scenes s
                 JOIN sequences seq ON s.id_sequence = seq.id_sequence
                 JOIN episodes e ON seq.id_episode = e.id_episode
                 JOIN episode_scenaristes es ON e.id_episode = es.id_episode
                 JOIN scenaristes scena ON es.id_scenariste = scena.id_scenariste
                 WHERE scena.id_utilisateur = ?),
                (SELECT MAX(modifie_le)
                 FROM dialogues d
                 JOIN scenes s ON d.id_scene = s.id_scene
                 JOIN sequences seq ON s.id_sequence = seq.id_sequence
                 JOIN episodes e ON seq.id_episode = e.id_episode
                 JOIN episode_scenaristes es ON e.id_episode = es.id_episode
                 JOIN scenaristes scena ON es.id_scenariste = scena.id_scenariste
                 WHERE scena.id_utilisateur = ?),
                CURRENT_TIMESTAMP
            ) as dernier_acces
            """;
        
        return jdbcTemplate.queryForObject(sql, LocalDateTime.class, userId, userId);
    }
    
    private Integer getJoursActifs(Long userId) {
        LocalDate debutMois = LocalDate.now().withDayOfMonth(1);
        
        String sql = """
            SELECT COUNT(DISTINCT DATE(s.modifie_le)) as jours_actifs
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            WHERE scena.id_utilisateur = ? 
              AND s.modifie_le >= ?
            """;
        
        Long result = jdbcTemplate.queryForObject(sql, Long.class, userId, debutMois);
        return result != null ? result.intValue() : 0;
    }
    
    // Méthode pour les statistiques générales (projets actifs, scènes écrites, etc.)
    public Map<String, Object> getStatsGenerales(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Vérifier d'abord si l'utilisateur est associé à des épisodes
        if (!isScenaristeAssocieAProjets(userId)) {
            log.warn("Utilisateur {} n'est associé à aucun projet pour les stats générales", userId);
            return getDefaultScenaristeStats();
        }
        
        try {
            // Projets actifs (simplifié)
            String sqlProjets = """
                SELECT COUNT(DISTINCT p.id_projet) as projets_actifs
                FROM scenaristes scena
                JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                JOIN episodes e ON es.id_episode = e.id_episode
                JOIN projets p ON e.id_projet = p.id_projet
                LEFT JOIN projet_statuts ps ON p.id_projet = ps.id_projet AND ps.date_fin IS NULL
                LEFT JOIN statuts_projet sp ON ps.id_statut = sp.id_statut_projet
                WHERE scena.id_utilisateur = ? 
                  AND (sp.code IS NULL OR sp.code IN ('en_cours', 'en_pause'))
                """;
            
            Long projetsActifs = jdbcTemplate.queryForObject(sqlProjets, Long.class, userId);
            stats.put("projetsActifs", projetsActifs != null ? projetsActifs : 0);
            
            // Scènes écrites total
            String sqlScenes = """
                SELECT COUNT(DISTINCT s.id_scene) as scenes_ecrites
                FROM scenaristes scena
                JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                JOIN episodes e ON es.id_episode = e.id_episode
                JOIN sequences seq ON e.id_episode = seq.id_episode
                JOIN scenes s ON seq.id_sequence = s.id_sequence
                WHERE scena.id_utilisateur = ?
                """;
            
            Long scenesEcrites = jdbcTemplate.queryForObject(sqlScenes, Long.class, userId);
            stats.put("scenesEcrites", scenesEcrites != null ? scenesEcrites : 0);
            
            // Collaborations avec réalisateurs
            String sqlCollaborations = """
                SELECT COUNT(DISTINCT r.id_realisateur) as collaborations
                FROM scenaristes scena
                JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                JOIN episodes e ON es.id_episode = e.id_episode
                JOIN episode_realisateurs er ON e.id_episode = er.id_episode
                JOIN realisateurs r ON er.id_realisateur = r.id_realisateur
                WHERE scena.id_utilisateur = ?
                """;
            
            Long collaborations = jdbcTemplate.queryForObject(sqlCollaborations, Long.class, userId);
            stats.put("collaborations", collaborations != null ? collaborations : 0);
            
            // Réalisateurs actifs (c'est la même chose que collaborations)
            stats.put("realisateursActifs", collaborations != null ? collaborations : 0);
            
            // Échéances proches (7 jours)
            LocalDate aujourdhui = LocalDate.now();
            LocalDate dans7Jours = aujourdhui.plusDays(7);
            
            String sqlEcheances = """
                SELECT COUNT(DISTINCT p.id_projet) as echeances_proches
                FROM scenaristes scena
                JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                JOIN episodes e ON es.id_episode = e.id_episode
                JOIN projets p ON e.id_projet = p.id_projet
                WHERE scena.id_utilisateur = ? 
                  AND p.date_fin IS NOT NULL
                  AND p.date_fin BETWEEN ? AND ?
                """;
            
            Long echeancesProches = jdbcTemplate.queryForObject(sqlEcheances, Long.class, 
                userId, aujourdhui, dans7Jours);
            stats.put("echeancesProches", echeancesProches != null ? echeancesProches : 0);
            
            // Échéances urgentes (2 jours)
            LocalDate dans2Jours = aujourdhui.plusDays(2);
            
            String sqlUrgent = """
                SELECT COUNT(DISTINCT p.id_projet) as echeances_urgentes
                FROM scenaristes scena
                JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                JOIN episodes e ON es.id_episode = e.id_episode
                JOIN projets p ON e.id_projet = p.id_projet
                WHERE scena.id_utilisateur = ? 
                  AND p.date_fin IS NOT NULL
                  AND p.date_fin BETWEEN ? AND ?
                """;
            
            Long urgentCount = jdbcTemplate.queryForObject(sqlUrgent, Long.class, 
                userId, aujourdhui, dans2Jours);
            stats.put("urgentCount", urgentCount != null ? urgentCount : 0);
            
            // Ajouter les variations (calculées basiquement)
            stats.put("projetsVariation", calculateVariationProjets(userId));
            stats.put("scenesVariation", calculateVariationScenes(userId));
            
        } catch (Exception e) {
            log.error("Erreur dans getStatsGenerales pour userId: {}", userId, e);
            return getDefaultScenaristeStats();
        }
        
        return stats;
    }
    
    private int calculateVariationProjets(Long userId) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debutMois = aujourdhui.withDayOfMonth(1);
        LocalDate debutMoisPrecedent = debutMois.minusMonths(1);
        
        String sql = """
            SELECT 
                (SELECT COUNT(DISTINCT p.id_projet)
                 FROM scenaristes scena
                 JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                 JOIN episodes e ON es.id_episode = e.id_episode
                 JOIN projets p ON e.id_projet = p.id_projet
                 WHERE scena.id_utilisateur = ?
                   AND p.cree_le >= ? AND p.cree_le < ?) as ce_mois,
                (SELECT COUNT(DISTINCT p.id_projet)
                 FROM scenaristes scena
                 JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                 JOIN episodes e ON es.id_episode = e.id_episode
                 JOIN projets p ON e.id_projet = p.id_projet
                 WHERE scena.id_utilisateur = ?
                   AND p.cree_le >= ? AND p.cree_le < ?) as mois_precedent
            """;
        
        try {
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, 
                userId, debutMois, aujourdhui,
                userId, debutMoisPrecedent, debutMois);
            
            Long ceMois = (Long) result.get("ce_mois");
            Long moisPrecedent = (Long) result.get("mois_precedent");
            
            if (moisPrecedent == null || moisPrecedent == 0) {
                return ceMois != null && ceMois > 0 ? 100 : 0;
            }
            
            double variation = ((ceMois.doubleValue() - moisPrecedent.doubleValue()) 
                              / moisPrecedent.doubleValue()) * 100;
            return (int) Math.round(variation);
        } catch (Exception e) {
            log.warn("Impossible de calculer la variation des projets", e);
            return 0;
        }
    }
    
    private int calculateVariationScenes(Long userId) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debutMois = aujourdhui.withDayOfMonth(1);
        LocalDate debutMoisPrecedent = debutMois.minusMonths(1);
        
        String sql = """
            SELECT 
                (SELECT COUNT(DISTINCT s.id_scene)
                 FROM scenaristes scena
                 JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                 JOIN episodes e ON es.id_episode = e.id_episode
                 JOIN sequences seq ON e.id_episode = seq.id_episode
                 JOIN scenes s ON seq.id_sequence = s.id_sequence
                 WHERE scena.id_utilisateur = ?
                   AND s.cree_le >= ? AND s.cree_le < ?) as ce_mois,
                (SELECT COUNT(DISTINCT s.id_scene)
                 FROM scenaristes scena
                 JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                 JOIN episodes e ON es.id_episode = e.id_episode
                 JOIN sequences seq ON e.id_episode = seq.id_episode
                 JOIN scenes s ON seq.id_sequence = s.id_sequence
                 WHERE scena.id_utilisateur = ?
                   AND s.cree_le >= ? AND s.cree_le < ?) as mois_precedent
            """;
        
        try {
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, 
                userId, debutMois, aujourdhui,
                userId, debutMoisPrecedent, debutMois);
            
            Long ceMois = (Long) result.get("ce_mois");
            Long moisPrecedent = (Long) result.get("mois_precedent");
            
            if (moisPrecedent == null || moisPrecedent == 0) {
                return ceMois != null && ceMois > 0 ? 100 : 0;
            }
            
            double variation = ((ceMois.doubleValue() - moisPrecedent.doubleValue()) 
                              / moisPrecedent.doubleValue()) * 100;
            return (int) Math.round(variation);
        } catch (Exception e) {
            log.warn("Impossible de calculer la variation des scènes", e);
            return 0;
        }
    }

    public List<Map<String, Object>> getRecentActivities(Long userId, Integer limit) {
        String sql = """
            SELECT 
                'edit' as type,
                s.id_scene as id,
                'Vous avez modifié la scène ' || s.ordre || ' de "' || p.titre || '"' as description,
                s.modifie_le as date,
                p.id_projet as projetId,
                p.titre as projetTitre
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            JOIN projets p ON e.id_projet = p.id_projet
            WHERE scena.id_utilisateur = ? 
              AND s.modifie_le >= CURRENT_DATE - INTERVAL '7 days'
            
            UNION ALL
            
            SELECT 
                'create' as type,
                e.id_episode as id,
                'Vous avez créé l''épisode ' || e.ordre || ' "' || e.titre || '"' as description,
                e.cree_le as date,
                p.id_projet as projetId,
                p.titre as projetTitre
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN projets p ON e.id_projet = p.id_projet
            WHERE scena.id_utilisateur = ? 
              AND e.cree_le >= CURRENT_DATE - INTERVAL '7 days'
            
            UNION ALL
            
            SELECT 
                'comment' as type,
                c.id_commentaire as id,
                'Nouveau commentaire sur votre scène' as description,
                c.cree_le as date,
                p.id_projet as projetId,
                p.titre as projetTitre
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN sequences seq ON e.id_episode = seq.id_episode
            JOIN scenes s ON seq.id_sequence = s.id_sequence
            JOIN scene_commentaires sc ON s.id_scene = sc.id_scene
            JOIN commentaires c ON sc.id_commentaire = c.id_commentaire
            JOIN projets p ON e.id_projet = p.id_projet
            WHERE scena.id_utilisateur = ? 
              AND c.cree_le >= CURRENT_DATE - INTERVAL '7 days'
              AND c.id_utilisateur != scena.id_utilisateur
            
            ORDER BY date DESC
            LIMIT ?
            """;
        
        return jdbcTemplate.query(sql, new Object[]{userId, userId, userId, limit}, (rs, rowNum) -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", rs.getLong("id"));
            activity.put("type", rs.getString("type"));
            activity.put("description", rs.getString("description"));
            activity.put("date", rs.getTimestamp("date").toLocalDateTime());
            activity.put("projetId", rs.getLong("projetId"));
            activity.put("projetTitre", rs.getString("projetTitre"));
            return activity;
        });
    }

    public List<Map<String, Object>> getPriorityProjects(Long userId, Integer limit) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate dans15Jours = aujourdhui.plusDays(15);
        
        String sql = """
            SELECT 
                p.id_projet as id,
                p.titre,
                p.date_fin,
                sp.nom_statuts_projet as statutNom,
                COUNT(DISTINCT s.id_scene) as total_scenes,
                COUNT(DISTINCT CASE WHEN sts.code = 'validee' THEN s.id_scene END) as scenes_terminees,
                CASE 
                    WHEN COUNT(DISTINCT s.id_scene) > 0 THEN 
                        (COUNT(DISTINCT CASE WHEN sts.code = 'validee' THEN s.id_scene END) * 100.0 / 
                        COUNT(DISTINCT s.id_scene))
                    ELSE 0 
                END as progression,
                CASE 
                    WHEN p.date_fin IS NULL THEN 'low'
                    WHEN p.date_fin <= ? THEN 'high'
                    WHEN p.date_fin <= ? THEN 'medium'
                    ELSE 'low'
                END as priorite
            FROM scenaristes scena
            JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
            JOIN episodes e ON es.id_episode = e.id_episode
            JOIN projets p ON e.id_projet = p.id_projet
            JOIN projet_statuts ps ON p.id_projet = ps.id_projet AND ps.date_fin IS NULL
            JOIN statuts_projet sp ON ps.id_statut = sp.id_statut_projet
            LEFT JOIN sequences seq ON e.id_episode = seq.id_episode
            LEFT JOIN scenes s ON seq.id_sequence = s.id_sequence
            LEFT JOIN scene_statuts ss ON s.id_scene = ss.id_scene AND ss.date_fin IS NULL
            LEFT JOIN statuts_scene sts ON ss.id_statut = sts.id_statut_scene
            WHERE scena.id_utilisateur = ? 
            AND sp.code IN ('en_cours', 'en_pause')
            GROUP BY p.id_projet, p.titre, p.date_fin, sp.nom_statuts_projet
            HAVING CASE 
                WHEN p.date_fin IS NULL THEN 'low'
                WHEN p.date_fin <= ? THEN 'high'
                WHEN p.date_fin <= ? THEN 'medium'
                ELSE 'low'
            END != 'low'
            ORDER BY 
                CASE 
                    WHEN p.date_fin IS NULL THEN 3
                    WHEN p.date_fin <= ? THEN 1
                    WHEN p.date_fin <= ? THEN 2
                    ELSE 3
                END,
                p.date_fin
            LIMIT ?
            """;
        
        LocalDate dans7Jours = aujourdhui.plusDays(7);
        
        return jdbcTemplate.query(sql, new Object[]{
            dans7Jours, dans15Jours, userId, dans7Jours, dans15Jours, dans7Jours, dans15Jours, limit
        }, (rs, rowNum) -> {
            Map<String, Object> project = new HashMap<>();
            project.put("id", rs.getLong("id"));
            project.put("titre", rs.getString("titre"));
            project.put("dateFin", rs.getDate("date_fin"));
            project.put("statutNom", rs.getString("statutNom"));
            project.put("priorite", rs.getString("priorite"));
            
            Double progression = rs.getDouble("progression");
            project.put("progress", progression != null ? Math.round(progression) : 0);
            
            return project;
        });
    }

    public Map<String, Object> getScenaristeStats(Long userId) {
        try {
            // Vérifier d'abord si l'utilisateur est associé à des épisodes
            if (!isScenaristeAssocieAProjets(userId)) {
                log.warn("Utilisateur {} n'est associé à aucun projet pour getScenaristeStats", userId);
                return getDefaultScenaristeStats();
            }
            
            String sql = """
                SELECT 
                    -- Projets actifs (simplifié)
                    (SELECT COUNT(DISTINCT p.id_projet)
                     FROM scenaristes scena
                     JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                     JOIN episodes e ON es.id_episode = e.id_episode
                     JOIN projets p ON e.id_projet = p.id_projet
                     LEFT JOIN projet_statuts ps ON p.id_projet = ps.id_projet AND ps.date_fin IS NULL
                     LEFT JOIN statuts_projet sp ON ps.id_statut = sp.id_statut_projet
                     WHERE scena.id_utilisateur = ?
                       AND (sp.code IS NULL OR sp.code IN ('en_cours', 'en_pause'))) as projets_actifs,
                    
                    -- Scènes écrites
                    (SELECT COUNT(DISTINCT s.id_scene)
                     FROM scenaristes scena
                     JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                     JOIN episodes e ON es.id_episode = e.id_episode
                     JOIN sequences seq ON e.id_episode = seq.id_episode
                     JOIN scenes s ON seq.id_sequence = s.id_sequence
                     WHERE scena.id_utilisateur = ?) as scenes_ecrites,
                    
                    -- Collaborations
                    (SELECT COUNT(DISTINCT r.id_realisateur)
                     FROM scenaristes scena
                     JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                     JOIN episodes e ON es.id_episode = e.id_episode
                     JOIN episode_realisateurs er ON e.id_episode = er.id_episode
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur
                     WHERE scena.id_utilisateur = ?) as collaborations,
                    
                    -- Échéances proches (dans les 7 jours)
                    (SELECT COUNT(DISTINCT p.id_projet)
                     FROM scenaristes scena
                     JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                     JOIN episodes e ON es.id_episode = e.id_episode
                     JOIN projets p ON e.id_projet = p.id_projet
                     WHERE scena.id_utilisateur = ?
                     AND p.date_fin IS NOT NULL
                     AND p.date_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as echeances_proches,
                    
                    -- Échéances urgentes (dans les 2 jours)
                    (SELECT COUNT(DISTINCT p.id_projet)
                     FROM scenaristes scena
                     JOIN episode_scenaristes es ON scena.id_scenariste = es.id_scenariste
                     JOIN episodes e ON es.id_episode = e.id_episode
                     JOIN projets p ON e.id_projet = p.id_projet
                     WHERE scena.id_utilisateur = ?
                     AND p.date_fin IS NOT NULL
                     AND p.date_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days') as urgent_count,
                    
                    -- Temps d'écriture estimé (méthode améliorée)
                    (SELECT COALESCE(
                        -- Scènes modifiées récemment × 45 min
                        (SELECT COUNT(DISTINCT s.id_scene) * 45
                         FROM scenes s
                         JOIN sequences seq ON s.id_sequence = seq.id_sequence
                         JOIN episodes e ON seq.id_episode = e.id_episode
                         JOIN episode_scenaristes es ON e.id_episode = es.id_episode
                         JOIN scenaristes sc ON es.id_scenariste = sc.id_scenariste
                         WHERE sc.id_utilisateur = ?
                           AND s.modifie_le >= CURRENT_DATE - INTERVAL '30 days')
                        +
                        -- Dialogues écrits récemment × 15 min
                        (SELECT COUNT(DISTINCT d.id_dialogue) * 15
                         FROM dialogues d
                         JOIN scenes s ON d.id_scene = s.id_scene
                         JOIN sequences seq ON s.id_sequence = seq.id_sequence
                         JOIN episodes e ON seq.id_episode = e.id_episode
                         JOIN episode_scenaristes es ON e.id_episode = es.id_episode
                         JOIN scenaristes sc ON es.id_scenariste = sc.id_scenariste
                         WHERE sc.id_utilisateur = ?
                           AND d.cree_le >= CURRENT_DATE - INTERVAL '30 days'),
                        0
                    )) as temps_ecriture_minutes
                """;
            
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, 
                userId, userId, userId, userId, userId, userId, userId);
            
            // Calculer les variations
            int projetsVariation = calculateVariationProjets(userId);
            int scenesVariation = calculateVariationScenes(userId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("projetsActifs", result.get("projets_actifs"));
            stats.put("scenesEcrites", result.get("scenes_ecrites"));
            stats.put("collaborations", result.get("collaborations"));
            stats.put("realisateursActifs", result.get("collaborations")); // Même valeur que collaborations
            stats.put("echeancesProches", result.get("echeances_proches"));
            stats.put("urgentCount", result.get("urgent_count"));
            stats.put("projetsVariation", projetsVariation);
            stats.put("scenesVariation", scenesVariation);
            
            // Temps d'écriture formaté
            Long minutes = ((Number) result.get("temps_ecriture_minutes")).longValue();
            Long hours = minutes / 60;
            Long remainingMinutes = minutes % 60;
            stats.put("tempsEcriture", String.format("%dh %02dmn", hours, remainingMinutes));
            
            return stats;
            
        } catch (Exception e) {
            log.error("Erreur lors du chargement des stats scénariste", e);
            return getDefaultScenaristeStats();
        }
    }

    private Map<String, Object> getDefaultScenaristeStats() {
        Map<String, Object> defaultStats = new HashMap<>();
        defaultStats.put("projetsActifs", 0);
        defaultStats.put("scenesEcrites", 0);
        defaultStats.put("collaborations", 0);
        defaultStats.put("realisateursActifs", 0);
        defaultStats.put("echeancesProches", 0);
        defaultStats.put("urgentCount", 0);
        defaultStats.put("tempsEcriture", "0h 00mn");
        defaultStats.put("projetsVariation", 0);
        defaultStats.put("scenesVariation", 0);
        return defaultStats;
    }

    public Map<String, Object> getDetailedWritingStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 1. Statistiques de temps d'écriture
            String sqlTemps = """
                SELECT 
                    COALESCE(SUM(duree_minutes), 0) as total_minutes,
                    COALESCE(COUNT(DISTINCT DATE(date_debut)), 0) as jours_ecriture,
                    CASE 
                        WHEN COUNT(DISTINCT DATE(date_debut)) > 0 
                        THEN SUM(duree_minutes) / COUNT(DISTINCT DATE(date_debut))
                        ELSE 0 
                    END as moyenne_journaliere_minutes,
                    COALESCE(SUM(mots_ajoutes), 0) as total_mots_ajoutes,
                    COALESCE(SUM(mots_supprimes), 0) as total_mots_supprimes,
                    COALESCE(SUM(mots_ajoutes) - SUM(mots_supprimes), 0) as mots_nets
                FROM suivi_ecriture
                WHERE id_utilisateur = ?
                AND date_debut >= CURRENT_DATE - INTERVAL '30 days'
                """;
            
            Map<String, Object> tempsStats = jdbcTemplate.queryForMap(sqlTemps, userId);
            
            Long totalMinutes = ((Number) tempsStats.get("total_minutes")).longValue();
            Long joursEcriture = ((Number) tempsStats.get("jours_ecriture")).longValue();
            Double moyenneJournaliere = ((Number) tempsStats.get("moyenne_journaliere_minutes")).doubleValue();
            Long totalMotsAjoutes = ((Number) tempsStats.get("total_mots_ajoutes")).longValue();
            Long totalMotsSupprimes = ((Number) tempsStats.get("total_mots_supprimes")).longValue();
            Long motsNets = ((Number) tempsStats.get("mots_nets")).longValue();
            
            // 2. Conversion en pages (250 mots/page par défaut)
            int motsParPage = 250;
            double totalPages = motsNets.doubleValue() / motsParPage;
            double moyennePagesParJour = joursEcriture > 0 ? totalPages / joursEcriture : 0;
            
            // 3. Période préférée
            String sqlPeriode = """
                SELECT periode_journee, SUM(duree_minutes) as total_minutes
                FROM suivi_ecriture
                WHERE id_utilisateur = ?
                AND periode_journee IS NOT NULL
                GROUP BY periode_journee
                ORDER BY total_minutes DESC
                LIMIT 1
                """;
            
            String periodePreferee = "Indéterminé";
            String iconePeriode = "fas fa-question";
            String couleurFond = "#f0f8ff";
            
            try {
                Map<String, Object> periodeResult = jdbcTemplate.queryForMap(sqlPeriode, userId);
                periodePreferee = (String) periodeResult.get("periode_journee");
                
                // Mapping période -> icône et couleur
                Map<String, String[]> periodeMapping = Map.of(
                    "matin", new String[]{"fas fa-sun", "#FFF9C4", "Matin (6h-12h)"},
                    "apres_midi", new String[]{"fas fa-sun", "#B3E5FC", "Après-midi (12h-18h)"},
                    "soir", new String[]{"fas fa-moon", "#E1BEE7", "Soir (18h-22h)"},
                    "nuit", new String[]{"fas fa-star", "#303030", "Nuit (22h-6h)"}
                );
                
                if (periodeMapping.containsKey(periodePreferee)) {
                    String[] details = periodeMapping.get(periodePreferee);
                    iconePeriode = details[0];
                    couleurFond = details[1];
                    periodePreferee = details[2];
                }
            } catch (Exception e) {
                log.info("Pas de période préférée trouvée pour l'utilisateur {}", userId);
            }
            
            // 4. Distribution par période
            String sqlDistribution = """
                SELECT 
                    periode_journee,
                    SUM(duree_minutes) as minutes,
                    COUNT(*) as sessions
                FROM suivi_ecriture
                WHERE id_utilisateur = ?
                AND periode_journee IS NOT NULL
                GROUP BY periode_journee
                ORDER BY 
                    CASE periode_journee
                        WHEN 'matin' THEN 1
                        WHEN 'apres_midi' THEN 2
                        WHEN 'soir' THEN 3
                        WHEN 'nuit' THEN 4
                        ELSE 5
                    END
                """;
            
            List<Map<String, Object>> distribution = jdbcTemplate.query(sqlDistribution, new Object[]{userId}, (rs, rowNum) -> {
                Map<String, Object> item = new HashMap<>();
                item.put("periode", rs.getString("periode_journee"));
                item.put("minutes", rs.getLong("minutes"));
                item.put("sessions", rs.getLong("sessions"));
                return item;
            });
            
            // 5. Conseils personnalisés
            List<String> conseils = generateConseils(totalMinutes, joursEcriture, periodePreferee, motsNets);
            
            // 6. Récapitulatif des mots par type de contenu
            String sqlMotsParType = """
                SELECT 
                    type_contenu,
                    SUM(mots_ajoutes - mots_supprimes) as mots_nets,
                    COUNT(DISTINCT id_contenu) as nombre_elements
                FROM suivi_ecriture
                WHERE id_utilisateur = ?
                AND type_contenu IS NOT NULL
                GROUP BY type_contenu
                ORDER BY mots_nets DESC
                """;
            
            List<Map<String, Object>> motsParType = jdbcTemplate.query(sqlMotsParType, new Object[]{userId}, (rs, rowNum) -> {
                Map<String, Object> item = new HashMap<>();
                item.put("type", rs.getString("type_contenu"));
                item.put("mots", rs.getLong("mots_nets"));
                item.put("elements", rs.getLong("nombre_elements"));
                return item;
            });
            
            // Compilation des statistiques
            stats.put("tempsTotalMinutes", totalMinutes);
            stats.put("tempsTotalFormate", formatTemps(totalMinutes));
            stats.put("joursEcriture", joursEcriture);
            stats.put("moyenneQuotidienneMinutes", Math.round(moyenneJournaliere));
            stats.put("moyenneQuotidienneFormate", formatTemps(Math.round(moyenneJournaliere)));
            
            stats.put("motsAjoutes", totalMotsAjoutes);
            stats.put("motsSupprimes", totalMotsSupprimes);
            stats.put("motsNets", motsNets);
            stats.put("motsParJour", joursEcriture > 0 ? Math.round(motsNets.doubleValue() / joursEcriture) : 0);
            
            stats.put("totalPages", Math.round(totalPages * 10.0) / 10.0); // 1 décimale
            stats.put("moyennePagesParJour", Math.round(moyennePagesParJour * 10.0) / 10.0);
            stats.put("motsParPage", motsParPage);
            
            stats.put("periodePreferee", periodePreferee);
            stats.put("iconePeriode", iconePeriode);
            stats.put("couleurFondPeriode", couleurFond);
            stats.put("distributionPeriodes", distribution);
            
            stats.put("conseils", conseils);
            stats.put("motsParType", motsParType);
            
            // Statistiques avancées
            stats.put("productiviteMotsParMinute", totalMinutes > 0 ? Math.round(motsNets.doubleValue() / totalMinutes * 10.0) / 10.0 : 0);
            stats.put("consistanceEcriture", calculerConsistance(joursEcriture));
            stats.put("tendanceMots", calculerTendanceMots(userId));
            
        } catch (Exception e) {
            log.error("Erreur lors du calcul des statistiques détaillées", e);
            stats = getDefaultWritingStats();
        }
        
        return stats;
    }

    private List<String> generateConseils(Long totalMinutes, Long joursEcriture, String periodePreferee, Long motsNets) {
        List<String> conseils = new ArrayList<>();
        
        if (totalMinutes == 0) {
            conseils.add("Commencez par écrire 15 minutes chaque jour pour établir une routine");
            conseils.add("Essayez la technique Pomodoro : 25 min d'écriture, 5 min de pause");
            return conseils;
        }
        
        // Conseils basés sur le temps
        if (totalMinutes < 300) { // Moins de 5h
            conseils.add("Augmentez progressivement votre temps d'écriture à 30 min par jour");
        } else if (totalMinutes > 1200) { // Plus de 20h
            conseils.add("Excellent rythme ! Pensez à faire des pauses régulières");
        }
        
        // Conseils basés sur la consistance
        if (joursEcriture < 5) {
            conseils.add("Essayez d'écrire au moins 5 jours par semaine pour plus de régularité");
        }
        
        // Conseils basés sur la période
        if (periodePreferee.contains("Matin")) {
            conseils.add("Vous êtes plus productif le matin : profitez-en pour écrire tôt !");
        } else if (periodePreferee.contains("Nuit")) {
            conseils.add("Écrire la nuit peut être créatif, mais veillez à votre sommeil");
        }
        
        // Conseils basés sur la production
        if (motsNets > 0 && motsNets < 1000) {
            conseils.add("Félicitations pour vos premiers " + motsNets + " mots !");
        } else if (motsNets >= 1000) {
            conseils.add("Impressionnant ! Vous avez écrit " + (motsNets / 1000) + " milliers de mots");
        }
        
        // Conseil général
        conseils.add("Relisez-vous le lendemain pour un regard neuf sur votre texte");
        
        return conseils.subList(0, Math.min(conseils.size(), 3)); // Max 3 conseils
    }

    private String calculerConsistance(Long joursEcriture) {
        if (joursEcriture == 0) return "Débutant";
        if (joursEcriture <= 5) return "Intermittent";
        if (joursEcriture <= 15) return "Régulier";
        if (joursEcriture <= 25) return "Assidu";
        return "Expert";
    }

    private int calculerTendanceMots(Long userId) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debutCetteSemaine = aujourdhui.minusDays(7);
        LocalDate debutSemainePassee = debutCetteSemaine.minusDays(7);
        
        String sql = """
            SELECT 
                COALESCE(SUM(mots_ajoutes - mots_supprimes), 0) as mots
            FROM suivi_ecriture
            WHERE id_utilisateur = ?
            AND date_debut >= ? AND date_debut < ?
            """;
        
        Long cetteSemaine = jdbcTemplate.queryForObject(sql, Long.class, 
            userId, debutCetteSemaine, aujourdhui);
        
        Long semainePassee = jdbcTemplate.queryForObject(sql, Long.class, 
            userId, debutSemainePassee, debutCetteSemaine);
        
        if (semainePassee == null || semainePassee == 0) {
            return cetteSemaine != null && cetteSemaine > 0 ? 100 : 0;
        }
        
        double variation = ((cetteSemaine.doubleValue() - semainePassee.doubleValue()) 
                        / semainePassee.doubleValue()) * 100;
        return (int) Math.round(variation);
    }

    private Map<String, Object> getDefaultWritingStats() {
        Map<String, Object> defaultStats = new HashMap<>();
        defaultStats.put("tempsTotalMinutes", 0);
        defaultStats.put("tempsTotalFormate", "0h 00min");
        defaultStats.put("joursEcriture", 0);
        defaultStats.put("moyenneQuotidienneMinutes", 0);
        defaultStats.put("moyenneQuotidienneFormate", "0h 00min");
        
        defaultStats.put("motsAjoutes", 0);
        defaultStats.put("motsSupprimes", 0);
        defaultStats.put("motsNets", 0);
        defaultStats.put("motsParJour", 0);
        
        defaultStats.put("totalPages", 0);
        defaultStats.put("moyennePagesParJour", 0);
        defaultStats.put("motsParPage", 250);
        
        defaultStats.put("periodePreferee", "Indéterminé");
        defaultStats.put("iconePeriode", "fas fa-question");
        defaultStats.put("couleurFondPeriode", "#f0f8ff");
        defaultStats.put("distributionPeriodes", new ArrayList<>());
        
        defaultStats.put("conseils", Arrays.asList(
            "Commencez par écrire 15 minutes chaque jour",
            "Utilisez la technique Pomodoro pour rester concentré",
            "Relisez-vous le lendemain pour améliorer votre texte"
        ));
        defaultStats.put("motsParType", new ArrayList<>());
        
        defaultStats.put("productiviteMotsParMinute", 0);
        defaultStats.put("consistanceEcriture", "Débutant");
        defaultStats.put("tendanceMots", 0);
        
        return defaultStats;
    }

    private String formatTemps(Long minutes) {
        if (minutes == null || minutes == 0) return "0h 00min";
        long heures = minutes / 60;
        long mins = minutes % 60;
        return String.format("%dh %02dmin", heures, mins);
    }

    // Ajoutez cette méthode pour le suivi en temps réel
    public void enregistrerSessionEcriture(Long userId, Long projetId, String typeContenu, 
                                        Long contenuId, Integer dureeMinutes, 
                                        Integer motsAjoutes, Integer motsSupprimes,
                                        LocalDateTime dateDebut, LocalDateTime dateFin) {
        
        // Déterminer la période de la journée
        String periodeJournee = determinerPeriodeJournee(dateDebut);
        String jourSemaine = dateDebut.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.FRENCH);
        
        String sql = """
            INSERT INTO suivi_ecriture 
            (id_utilisateur, id_projet, type_contenu, 
            id_scene, id_dialogue, duree_minutes,
            mots_ajoutes, mots_supprimes, date_debut, date_fin,
            periode_journee, jour_semaine)
            VALUES (?, ?, ?, 
                    CASE WHEN ? = 'scene' THEN ? ELSE NULL END,
                    CASE WHEN ? = 'dialogue' THEN ? ELSE NULL END,
                    ?, ?, ?, ?, ?, ?, ?)
            """;
        
        jdbcTemplate.update(sql, 
            userId, projetId, typeContenu,
            typeContenu, contenuId,
            typeContenu, contenuId,
            dureeMinutes, motsAjoutes, motsSupprimes,
            dateDebut, dateFin, periodeJournee, jourSemaine);
    }

    private String determinerPeriodeJournee(LocalDateTime dateTime) {
        int heure = dateTime.getHour();
        if (heure >= 6 && heure < 12) return "matin";
        if (heure >= 12 && heure < 18) return "apres_midi";
        if (heure >= 18 && heure < 22) return "soir";
        return "nuit";
    }

    // Ajoutez un endpoint pour récupérer les stats détaillées
    public Map<String, Object> getStatsEcritureDetaillees(Long userId) {
        return getDetailedWritingStats(userId);
    }
}


package com.example.films.controller;

import com.example.films.dto.EpisodeDTO;
import com.example.films.dto.ScenaristeDTO;
import com.example.films.service.EpisodeService;
import com.example.films.service.ScenaristeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scenaristes")
public class ScenaristeController {
    
    private final ScenaristeService scenaristeService;
    private final EpisodeService episodeService;
    
    public ScenaristeController(ScenaristeService scenaristeService, EpisodeService episodeService) {
        this.scenaristeService = scenaristeService;
        this.episodeService = episodeService;
    }
    
    @GetMapping
    public List<ScenaristeDTO> getAllScenaristes() {
        return scenaristeService.getAllScenaristes();
    }

    @GetMapping("/{scenaristeId}/episodes")
    public ResponseEntity<List<EpisodeDTO>> getEpisodesByScenariste(@PathVariable Long scenaristeId) {
        try {
            List<EpisodeDTO> episodes = episodeService.getEpisodesByScenaristeId(scenaristeId);
            return ResponseEntity.ok(episodes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ========== NOUVEAUX ENDPOINTS POUR LES STATISTIQUES ==========
    
    @GetMapping("/stats/productivite")
    public ResponseEntity<Map<String, Object>> getProductiviteStats(@RequestParam Long userId) {
        try {
            Map<String, Object> stats = scenaristeService.getProductiviteStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("productivite", 0);
            errorResponse.put("scenesModifiees7j", 0);
            errorResponse.put("tendanceScenes", 0);
            errorResponse.put("tempsTotalMinutes", 0);
            errorResponse.put("moyenneQuotidienneMinutes", 0);
            errorResponse.put("sessionMoyenneMinutes", 45);
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @GetMapping("/stats/activites-recentes")
    public ResponseEntity<Map<String, Object>> getRecentActivities(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Map<String, Object>> activities = scenaristeService.getRecentActivities(userId, limit);
            Map<String, Object> response = new HashMap<>();
            response.put("activities", activities);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("activities", List.of());
            return ResponseEntity.ok(errorResponse);
        }
    }
}


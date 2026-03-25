package com.example.films.controller;

import com.example.films.dto.EpisodeDTO;
import com.example.films.dto.ScenaristeDTO;
import com.example.films.service.EpisodeService;
import com.example.films.service.ScenaristeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}


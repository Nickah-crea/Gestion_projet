package com.example.films.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class GlobalStatisticsDTO {
    private Map<String, Object> kpi; // Garder comme Map
    private Map<String, StatisticItem> statistics;
    private List<ProjectRanking> topProjects;
    private List<TeamDistribution> teamDistribution;
    private List<ProjectDetail> projectsDetail;
    private List<MonthlyProgress> monthlyProgress;


    @Data
    public static class StatisticItem {
        private Long total;
        private Map<String, Double> percentages;
        private Map<String, Long> counts;
    }

    @Data
    public static class ProjectRanking {
        private Long id;
        private String nom;
        private Long episodes;
        private Long scenes;
        private Double progression;
    }

    @Data
    public static class TeamDistribution {
        private String nom;
        private Long count;
        private Double percentage;
    }

    @Data
    public static class ProjectDetail {
        private Long id;
        private String nom;
        private String description;
        private Long episodes;
        private Long episodesTermines;
        private Long sequences;
        private Long scenes;
        private Long scenesTerminees;
        private Long dialogues;
        private Double progression;
        private List<TeamMember> equipe;
        private String lastUpdate;
    }

    @Data
    public static class TeamMember {
        private Long id;
        private String nom;
    }

    @Data
    public static class MonthlyProgress {
        private String mois;
        private Long episodes;
        private Long sequences;
        private Long scenes;
    }
}

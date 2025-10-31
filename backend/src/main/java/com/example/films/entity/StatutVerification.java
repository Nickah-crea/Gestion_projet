package com.example.films.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "statuts_verification")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatutVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_statut_verification")
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(name = "nom_statut", nullable = false)
    private String nomStatut;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage = 1;

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @Column(name = "cree_le")
    private LocalDateTime creeLe = LocalDateTime.now();
}
package com.example.films.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_raccords")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRaccord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_verification")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_raccord")
    private Raccord raccord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @Column(name = "date_verification")
    private LocalDateTime dateVerification = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_statut_verification")
    private StatutVerification statutVerification;

    @Column(name = "notes_verification", columnDefinition = "TEXT")
    private String notesVerification;

    @Column(name = "preuve_image")
    private String preuveImage;
}
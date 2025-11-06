package com.example.films.repository;

import com.example.films.entity.VerificationRaccord;
import com.example.films.entity.StatutVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VerificationRaccordRepository extends JpaRepository<VerificationRaccord, Long> {
    
    List<VerificationRaccord> findByRaccordIdOrderByDateVerificationDesc(Long raccordId);
    
    @Query("SELECT v FROM VerificationRaccord v WHERE v.raccord.id = :raccordId ORDER BY v.dateVerification DESC")
    List<VerificationRaccord> findHistoriqueByRaccordId(@Param("raccordId") Long raccordId);
    
    @Query("SELECT s FROM StatutVerification s WHERE s.code = :code")
    Optional<StatutVerification> findStatutByCode(@Param("code") String code);
    
    // Méthodes de comptage
    @Query("SELECT COUNT(v) FROM VerificationRaccord v WHERE v.statutVerification.code = :code")
    long countByStatutVerificationCode(@Param("code") String code);
    
    @Query("SELECT COUNT(v) FROM VerificationRaccord v WHERE v.raccord.estCritique = true")
    long countByRaccordEstCritiqueTrue();
    
    Optional<VerificationRaccord> findFirstByRaccordIdOrderByDateVerificationDesc(Long raccordId);
     @Query("SELECT s FROM StatutVerification s WHERE s.code = :code")
    Optional<StatutVerification> findByCode(@Param("code") String code);

    @Query("SELECT vr FROM VerificationRaccord vr " +
           "LEFT JOIN FETCH vr.raccord r " +
           "LEFT JOIN FETCH r.typeRaccord " +
           "LEFT JOIN FETCH r.sceneSource " +
           "LEFT JOIN FETCH r.sceneCible " +
           "LEFT JOIN FETCH vr.utilisateur " +
           "LEFT JOIN FETCH vr.statutVerification")
    List<VerificationRaccord> findAllWithDetails();
}




  
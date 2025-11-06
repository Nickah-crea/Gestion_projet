package com.example.films.repository;

import com.example.films.entity.StatutVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatutVerificationRepository extends JpaRepository<StatutVerification, Long> {
    @Query("SELECT s FROM StatutVerification s WHERE s.code = :code")
    Optional<StatutVerification> findByCode(@Param("code") String code);
    List<StatutVerification> findByEstActifTrueOrderByOrdreAffichage();
}
package com.example.films.repository;

import com.example.films.entity.StatutVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatutVerificationRepository extends JpaRepository<StatutVerification, Long> {
    Optional<StatutVerification> findByCode(String code);
    List<StatutVerification> findByEstActifTrueOrderByOrdreAffichage();
}
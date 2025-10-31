package com.example.films.repository;

import com.example.films.entity.VerificationRaccord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VerificationRaccordRepository extends JpaRepository<VerificationRaccord, Long> {
    List<VerificationRaccord> findByRaccordIdOrderByDateVerificationDesc(Long raccordId);
    Optional<VerificationRaccord> findFirstByRaccordIdOrderByDateVerificationDesc(Long raccordId);
}
package com.example.films.repository;

import com.example.films.entity.RaccordPlanning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RaccordPlanningRepository extends JpaRepository<RaccordPlanning, Long> {
    
    List<RaccordPlanning> findByRaccordId(Long raccordId);
    
    @Query("SELECT rp FROM RaccordPlanning rp WHERE rp.planningTournage.id = :planningId")
    List<RaccordPlanning> findByPlanningTournageId(@Param("planningId") Long planningId);
    
    @Query("SELECT rp FROM RaccordPlanning rp WHERE rp.raccord.id = :raccordId AND rp.typeLiaison = :typeLiaison")
    Optional<RaccordPlanning> findByRaccordIdAndType(@Param("raccordId") Long raccordId, 
                                                   @Param("typeLiaison") String typeLiaison);
    
    @Query("SELECT rp FROM RaccordPlanning rp WHERE rp.planningTournage.id IN " +
           "(SELECT pt.id FROM PlanningTournage pt WHERE pt.dateTournage = :date)")
    List<RaccordPlanning> findByDateTournage(@Param("date") java.time.LocalDate date);
    
    void deleteByRaccordIdAndTypeLiaison(Long raccordId, String typeLiaison);
}
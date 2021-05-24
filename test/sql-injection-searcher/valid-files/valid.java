package com.chorse.chorse.application.repository;

import com.chorse.chorse.application.model.Clash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClashRepository extends JpaRepository<Clash, Long> {

    @Query("select c from Clash c where c.house.id = :houseId and c.completeDate is null")
    Optional<Clash> getHouseActiveClash(@Param("houseId") Long houseId);
}

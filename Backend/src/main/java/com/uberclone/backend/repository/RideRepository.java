package com.uberclone.backend.repository;

import com.uberclone.backend.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, String> {
    Optional<Ride> findByIdAndCaptainId(String id, String captainId);

    List<Ride> findByUserIdOrderByIdDesc(String userId);

    List<Ride> findByCaptainIdOrderByIdDesc(String captainId);
}

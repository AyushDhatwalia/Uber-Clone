package com.uberclone.backend.repository;

import com.uberclone.backend.model.Captain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CaptainRepository extends JpaRepository<Captain, String> {
    Optional<Captain> findByEmail(String email);

    List<Captain> findByH3IndexIn(Collection<String> h3Indexes);

    List<Captain> findBySocketIdIsNotNull();
}

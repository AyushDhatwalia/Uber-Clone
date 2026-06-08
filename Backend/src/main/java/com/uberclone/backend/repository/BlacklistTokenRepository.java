package com.uberclone.backend.repository;

import com.uberclone.backend.model.BlacklistToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface BlacklistTokenRepository extends JpaRepository<BlacklistToken, String> {
    boolean existsByToken(String token);

    void deleteByCreatedAtBefore(Instant cutoff);
}

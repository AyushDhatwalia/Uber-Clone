package com.uberclone.backend.service;

import com.uberclone.backend.repository.BlacklistTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class BlacklistTokenCleanupService {
    private final BlacklistTokenRepository blacklistTokenRepository;

    public BlacklistTokenCleanupService(BlacklistTokenRepository blacklistTokenRepository) {
        this.blacklistTokenRepository = blacklistTokenRepository;
    }

    @Transactional
    @Scheduled(fixedDelayString = "${app.blacklist-token-cleanup-delay-ms:3600000}")
    public void deleteExpiredTokens() {
        blacklistTokenRepository.deleteByCreatedAtBefore(Instant.now().minus(24, ChronoUnit.HOURS));
    }
}

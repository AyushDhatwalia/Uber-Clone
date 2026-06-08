package com.uberclone.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationHours;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours}") long expirationHours) {
        String configuredSecret = secret == null || secret.isBlank() ? "change-this-secret-before-production" : secret;
        String normalizedSecret = configuredSecret.length() < 32
                ? configuredSecret.repeat(32 / configuredSecret.length() + 1)
                : configuredSecret;
        this.key = Keys.hmacShaKeyFor(normalizedSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = expirationHours;
    }

    public String generateToken(String subjectId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claim("_id", subjectId)
                .subject(subjectId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
                .signWith(key)
                .compact();
    }

    public String parseSubjectId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Object mongoId = claims.get("_id");
        return mongoId == null ? claims.getSubject() : mongoId.toString();
    }
}

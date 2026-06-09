package com.uberclone.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blacklist_tokens")
public class BlacklistToken {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public BlacklistToken() {
    }

    public BlacklistToken(String token) {
        this.token = token;
    }

    @PrePersist
    void assignId() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

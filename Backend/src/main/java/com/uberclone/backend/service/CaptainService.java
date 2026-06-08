package com.uberclone.backend.service;

import com.uberclone.backend.dto.CaptainRegisterRequest;
import com.uberclone.backend.exception.UnauthorizedException;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.repository.CaptainRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CaptainService {
    private final CaptainRepository captainRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public CaptainService(CaptainRepository captainRepository, BCryptPasswordEncoder passwordEncoder) {
        this.captainRepository = captainRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Captain register(CaptainRegisterRequest request) {
        captainRepository.findByEmail(request.getEmail()).ifPresent(captain -> {
            throw new IllegalArgumentException("Captain already exist");
        });
        Captain captain = new Captain();
        captain.setFullname(request.getFullname());
        captain.setEmail(request.getEmail().toLowerCase());
        captain.setPassword(passwordEncoder.encode(request.getPassword()));
        captain.setVehicle(request.getVehicle());
        return captainRepository.save(captain);
    }

    public Captain authenticate(String email, String password) {
        Captain captain = captainRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(password, captain.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return captain;
    }
}

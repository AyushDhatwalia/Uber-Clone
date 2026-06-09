package com.uberclone.backend.service;

import com.uberclone.backend.dto.UserRegisterRequest;
import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(UserRegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new IllegalArgumentException("User already exist");
        });
        User user = new User();
        user.setFullname(request.getFullname());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.uberclone.backend.exception.UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new com.uberclone.backend.exception.UnauthorizedException("Invalid email or password");
        }
        return user;
    }
}

package com.uberclone.backend.controller;

import com.uberclone.backend.dto.AuthResponse;
import com.uberclone.backend.dto.CaptainRegisterRequest;
import com.uberclone.backend.dto.LoginRequest;
import com.uberclone.backend.model.BlacklistToken;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.repository.BlacklistTokenRepository;
import com.uberclone.backend.service.AuthService;
import com.uberclone.backend.service.CaptainService;
import com.uberclone.backend.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/captains")
public class CaptainController {
    private final CaptainService captainService;
    private final JwtService jwtService;
    private final AuthService authService;
    private final BlacklistTokenRepository blacklistTokenRepository;

    public CaptainController(CaptainService captainService,
                             JwtService jwtService,
                             AuthService authService,
                             BlacklistTokenRepository blacklistTokenRepository) {
        this.captainService = captainService;
        this.jwtService = jwtService;
        this.authService = authService;
        this.blacklistTokenRepository = blacklistTokenRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse<Captain> register(@Valid @RequestBody CaptainRegisterRequest request) {
        Captain captain = captainService.register(request);
        return AuthResponse.captain(jwtService.generateToken(captain.getId()), captain);
    }

    @PostMapping("/login")
    AuthResponse<Captain> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Captain captain = captainService.authenticate(request.getEmail(), request.getPassword());
        String token = jwtService.generateToken(captain.getId());
        response.addCookie(authCookie(token));
        return AuthResponse.captain(token, captain);
    }

    @GetMapping("/profile")
    Map<String, Captain> profile(HttpServletRequest request) {
        return Map.of("captain", authService.requireCaptain(request));
    }

    @GetMapping("/logout")
    Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = authService.requireToken(request);
        blacklistTokenRepository.save(new BlacklistToken(token));
        Cookie cookie = authCookie("");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return Map.of("message", "Logout successfully");
    }

    private Cookie authCookie(String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        return cookie;
    }
}

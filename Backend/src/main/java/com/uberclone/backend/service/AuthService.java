package com.uberclone.backend.service;

import com.uberclone.backend.exception.UnauthorizedException;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.BlacklistTokenRepository;
import com.uberclone.backend.repository.CaptainRepository;
import com.uberclone.backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CaptainRepository captainRepository;
    private final BlacklistTokenRepository blacklistTokenRepository;

    public AuthService(JwtService jwtService,
                       UserRepository userRepository,
                       CaptainRepository captainRepository,
                       BlacklistTokenRepository blacklistTokenRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.captainRepository = captainRepository;
        this.blacklistTokenRepository = blacklistTokenRepository;
    }

    public User requireUser(HttpServletRequest request) {
        String token = requireToken(request);
        if (blacklistTokenRepository.existsByToken(token)) {
            throw new UnauthorizedException("Unauthorized");
        }
        String id = jwtService.parseSubjectId(token);
        return userRepository.findById(id).orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }

    public Captain requireCaptain(HttpServletRequest request) {
        String token = requireToken(request);
        if (blacklistTokenRepository.existsByToken(token)) {
            throw new UnauthorizedException("Unauthorized");
        }
        String id = jwtService.parseSubjectId(token);
        return captainRepository.findById(id).orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }

    public String requireToken(HttpServletRequest request) {
        String token = tokenFromCookie(request);
        if (token == null) {
            token = tokenFromAuthorization(request);
        }
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Unauthorized");
        }
        return token;
    }

    private String tokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> "token".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private String tokenFromAuthorization(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring(7);
    }
}

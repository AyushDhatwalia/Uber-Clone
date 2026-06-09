package com.uberclone.backend.controller;

import com.uberclone.backend.dto.AuthResponse;
import com.uberclone.backend.dto.LoginRequest;
import com.uberclone.backend.dto.UserRegisterRequest;
import com.uberclone.backend.model.BlacklistToken;
import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.BlacklistTokenRepository;
import com.uberclone.backend.service.AuthService;
import com.uberclone.backend.service.JwtService;
import com.uberclone.backend.service.UserService;
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
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthService authService;
    private final BlacklistTokenRepository blacklistTokenRepository;

    public UserController(UserService userService,
                          JwtService jwtService,
                          AuthService authService,
                          BlacklistTokenRepository blacklistTokenRepository) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authService = authService;
        this.blacklistTokenRepository = blacklistTokenRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse<User> register(@Valid @RequestBody UserRegisterRequest request) {
        User user = userService.register(request);
        return AuthResponse.user(jwtService.generateToken(user.getId()), user);
    }

    @PostMapping("/login")
    AuthResponse<User> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        String token = jwtService.generateToken(user.getId());
        response.addCookie(authCookie(token));
        return AuthResponse.user(token, user);
    }

    @GetMapping("/profile")
    User profile(HttpServletRequest request) {
        return authService.requireUser(request);
    }

    @GetMapping("/logout")
    Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = authService.requireToken(request);
        blacklistTokenRepository.save(new BlacklistToken(token));
        Cookie cookie = authCookie("");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return Map.of("message", "Logged out");
    }

    private Cookie authCookie(String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        return cookie;
    }
}

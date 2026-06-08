package com.uberclone.backend.dto;

public class AuthResponse<T> {
    private String token;
    private T user;
    private T captain;

    private AuthResponse(String token, T user, T captain) {
        this.token = token;
        this.user = user;
        this.captain = captain;
    }

    public static <T> AuthResponse<T> user(String token, T user) {
        return new AuthResponse<>(token, user, null);
    }

    public static <T> AuthResponse<T> captain(String token, T captain) {
        return new AuthResponse<>(token, null, captain);
    }

    public String getToken() {
        return token;
    }

    public T getUser() {
        return user;
    }

    public T getCaptain() {
        return captain;
    }
}

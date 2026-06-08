package com.uberclone.backend.dto;

import com.uberclone.backend.model.FullName;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRegisterRequest {
    @Valid
    private FullName fullname;

    @Email(message = "Invalid Email")
    @NotBlank
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    public FullName getFullname() {
        return fullname;
    }

    public void setFullname(FullName fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

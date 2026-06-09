package com.uberclone.backend.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;

@Embeddable
public class FullName {
    @Size(min = 3, message = "First name must be at least 3 characters long")
    private String firstname;

    @Size(min = 3, message = "Last name must be at least 3 characters long")
    private String lastname;

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
}

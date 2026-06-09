package com.uberclone.backend.dto;

import com.uberclone.backend.model.Location;

public class CaptainLocationRequest {
    private String userId;
    private Location location;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }
}

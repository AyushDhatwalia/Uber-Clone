package com.uberclone.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RideIdRequest {
    @NotBlank(message = "Invalid ride id")
    private String rideId;

    public String getRideId() {
        return rideId;
    }

    public void setRideId(String rideId) {
        this.rideId = rideId;
    }
}

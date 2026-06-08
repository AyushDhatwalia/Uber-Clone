package com.uberclone.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateRideRequest {
    @NotBlank
    @Size(min = 3, message = "Invalid pickup address")
    private String pickup;

    @NotBlank
    @Size(min = 3, message = "Invalid destination address")
    private String destination;

    @Pattern(regexp = "auto|car|moto", message = "Invalid vehicle type")
    private String vehicleType;

    public String getPickup() {
        return pickup;
    }

    public void setPickup(String pickup) {
        this.pickup = pickup;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
}

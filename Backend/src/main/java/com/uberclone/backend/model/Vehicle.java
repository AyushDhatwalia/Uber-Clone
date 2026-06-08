package com.uberclone.backend.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Embeddable
public class Vehicle {
    @NotBlank
    @Size(min = 3, message = "Color must be at least 3 characters long")
    private String color;

    @NotBlank
    @Size(min = 3, message = "Plate must be at least 3 characters long")
    private String plate;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Pattern(regexp = "car|motorcycle|auto", message = "Invalid vehicle type")
    private String vehicleType;

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
}

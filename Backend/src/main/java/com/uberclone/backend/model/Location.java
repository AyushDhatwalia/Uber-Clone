package com.uberclone.backend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Location {
    private Double ltd;
    private Double lng;

    public Location() {
    }

    public Location(Double ltd, Double lng) {
        this.ltd = ltd;
        this.lng = lng;
    }

    public Double getLtd() {
        return ltd;
    }

    public void setLtd(Double ltd) {
        this.ltd = ltd;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }
}

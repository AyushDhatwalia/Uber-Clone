package com.uberclone.backend.application.service;

import com.uberclone.backend.application.port.CaptainLocationIndexPort;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Location;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaptainLocationService {
    private final CaptainLocationIndexPort captainLocationIndexPort;

    public CaptainLocationService(CaptainLocationIndexPort captainLocationIndexPort) {
        this.captainLocationIndexPort = captainLocationIndexPort;
    }

    public Captain updateCaptainLocation(String captainId, Location location) {
        if (location == null || location.getLtd() == null || location.getLng() == null) {
            throw new IllegalArgumentException("Invalid location data");
        }
        return captainLocationIndexPort.updateCaptainLocation(captainId, location);
    }

    public List<Captain> findCaptainsNear(Location location, double radiusKm) {
        if (location == null || location.getLtd() == null || location.getLng() == null) {
            throw new IllegalArgumentException("Invalid location data");
        }
        return captainLocationIndexPort.findCaptainsNear(location, radiusKm);
    }

    public List<Captain> findAllOnlineCaptains() {
        return captainLocationIndexPort.findAllOnlineCaptains();
    }
}

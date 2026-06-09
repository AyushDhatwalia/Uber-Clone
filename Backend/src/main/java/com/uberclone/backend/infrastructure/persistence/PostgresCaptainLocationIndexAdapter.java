package com.uberclone.backend.infrastructure.persistence;

import com.uberclone.backend.application.port.CaptainLocationIndexPort;
import com.uberclone.backend.application.port.GeoIndexPort;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Location;
import com.uberclone.backend.repository.CaptainRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PostgresCaptainLocationIndexAdapter implements CaptainLocationIndexPort {
    private final CaptainRepository captainRepository;
    private final GeoIndexPort geoIndexPort;

    public PostgresCaptainLocationIndexAdapter(CaptainRepository captainRepository, GeoIndexPort geoIndexPort) {
        this.captainRepository = captainRepository;
        this.geoIndexPort = geoIndexPort;
    }

    @Override
    public Captain updateCaptainLocation(String captainId, Location location) {
        Captain captain = captainRepository.findById(captainId)
                .orElseThrow(() -> new RuntimeException("Captain not found"));
        captain.setLocation(location);
        captain.setH3Index(geoIndexPort.index(location));
        return captainRepository.save(captain);
    }

    @Override
    public List<Captain> findCaptainsNear(Location location, double radiusKm) {
        List<String> candidateCells = geoIndexPort.nearbyIndexes(location);
        return captainRepository.findByH3IndexIn(candidateCells).stream()
                .filter(captain -> captain.getLocation() != null)
                .filter(captain -> captain.getLocation().getLtd() != null && captain.getLocation().getLng() != null)
                .filter(captain -> distanceKm(location, captain.getLocation()) <= radiusKm)
                .toList();
    }

    @Override
    public List<Captain> findAllOnlineCaptains() {
        return captainRepository.findBySocketIdIsNotNull();
    }

    private double distanceKm(Location left, Location right) {
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(right.getLtd() - left.getLtd());
        double dLon = Math.toRadians(right.getLng() - left.getLng());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(left.getLtd())) * Math.cos(Math.toRadians(right.getLtd()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}

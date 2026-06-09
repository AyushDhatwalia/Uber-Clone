package com.uberclone.backend.application.port;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Location;

import java.util.List;

public interface CaptainLocationIndexPort {
    Captain updateCaptainLocation(String captainId, Location location);

    List<Captain> findCaptainsNear(Location location, double radiusKm);

    List<Captain> findAllOnlineCaptains();
}


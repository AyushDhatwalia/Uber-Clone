package com.uberclone.backend.application.port;

import com.uberclone.backend.model.Location;

import java.util.List;

public interface GeoIndexPort {
    String index(Location location);

    List<String> nearbyIndexes(Location location);
}

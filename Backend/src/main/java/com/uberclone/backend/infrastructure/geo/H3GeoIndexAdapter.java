package com.uberclone.backend.infrastructure.geo;

import com.uber.h3core.H3Core;
import com.uberclone.backend.application.port.GeoIndexPort;
import com.uberclone.backend.model.Location;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class H3GeoIndexAdapter implements GeoIndexPort {
    private final H3Core h3Core;
    private final int resolution;
    private final int searchRingSize;

    public H3GeoIndexAdapter(@Value("${app.geo.h3-resolution}") int resolution,
                             @Value("${app.geo.h3-search-ring-size}") int searchRingSize) throws IOException {
        this.h3Core = H3Core.newInstance();
        this.resolution = resolution;
        this.searchRingSize = searchRingSize;
    }

    @Override
    public String index(Location location) {
        return h3Core.latLngToCellAddress(location.getLtd(), location.getLng(), resolution);
    }

    @Override
    public List<String> nearbyIndexes(Location location) {
        return h3Core.gridDisk(index(location), searchRingSize);
    }
}

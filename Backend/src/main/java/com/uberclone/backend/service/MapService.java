package com.uberclone.backend.service;

import com.uberclone.backend.model.Location;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class MapService {
    private final RestClient restClient;

    public MapService(RestClient restClient) {
        this.restClient = restClient;
    }

    public Location getAddressCoordinate(String address) {
        String url = UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", address)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .build()
                .toUriString();

        List<Map<String, Object>> response = getList(url);
        if (response.isEmpty()) {
            throw new RuntimeException("Unable to fetch coordinates");
        }
        Map<String, Object> location = response.getFirst();
        return new Location(Double.parseDouble((String) location.get("lat")), Double.parseDouble((String) location.get("lon")));
    }

    public Map<String, Object> getDistanceTime(String origin, String destination) {
        if (origin == null || destination == null) {
            throw new IllegalArgumentException("Origin and destination are required");
        }
        
        Location originLoc = getAddressCoordinate(origin);
        Location destLoc = getAddressCoordinate(destination);

        String url = UriComponentsBuilder.fromUriString("http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}")
                .buildAndExpand(originLoc.getLng(), originLoc.getLtd(), destLoc.getLng(), destLoc.getLtd())
                .toUriString() + "?overview=false";

        Map<String, Object> response = getMap(url);
        if (!"Ok".equals(response.get("code"))) {
            throw new RuntimeException("Unable to fetch distance and time");
        }
        
        List<Map<String, Object>> routes = castList(response.get("routes"));
        if (routes.isEmpty()) {
            throw new RuntimeException("No routes found");
        }
        Map<String, Object> route = routes.getFirst();
        
        // Convert to Google-like format expected by RideService
        return Map.of(
            "distance", Map.of("value", route.get("distance"), "text", route.get("distance") + " m"),
            "duration", Map.of("value", route.get("duration"), "text", route.get("duration") + " s"),
            "originLat", originLoc.getLtd(),
            "originLng", originLoc.getLng(),
            "destLat", destLoc.getLtd(),
            "destLng", destLoc.getLng()
        );
    }

    public List<String> getAutoCompleteSuggestions(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("query is required");
        }
        String url = UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", input)
                .queryParam("format", "json")
                .queryParam("limit", 5)
                .build()
                .toUriString();

        List<Map<String, Object>> response = getList(url);
        return response.stream()
                .map(prediction -> (String) prediction.get("display_name"))
                .toList();
    }

    private Map<String, Object> getMap(String url) {
        return restClient.get()
                .uri(url)
                .header("User-Agent", "UberClone/1.0")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    private List<Map<String, Object>> getList(String url) {
        return restClient.get()
                .uri(url)
                .header("User-Agent", "UberClone/1.0")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object value) {
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castList(Object value) {
        return (List<Map<String, Object>>) value;
    }
}

package com.uberclone.backend.controller;

import com.uberclone.backend.model.Location;
import com.uberclone.backend.service.AuthService;
import com.uberclone.backend.service.MapService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/maps")
public class MapController {
    private final MapService mapService;
    private final AuthService authService;

    public MapController(MapService mapService, AuthService authService) {
        this.mapService = mapService;
        this.authService = authService;
    }

    @GetMapping("/get-coordinates")
    Location getCoordinates(@RequestParam @Size(min = 3) String address, HttpServletRequest request) {
        authService.requireUser(request);
        return mapService.getAddressCoordinate(address);
    }

    @GetMapping("/get-distance-time")
    Map<String, Object> getDistanceTime(@RequestParam @Size(min = 3) String origin,
                                        @RequestParam @Size(min = 3) String destination,
                                        HttpServletRequest request) {
        authService.requireUser(request);
        return mapService.getDistanceTime(origin, destination);
    }

    @GetMapping("/get-suggestions")
    List<String> getSuggestions(@RequestParam @Size(min = 3) String input, HttpServletRequest request) {
        authService.requireUser(request);
        return mapService.getAutoCompleteSuggestions(input);
    }
}

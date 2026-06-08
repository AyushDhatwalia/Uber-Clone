package com.uberclone.backend.controller;

import com.uberclone.backend.dto.CreateRideRequest;
import com.uberclone.backend.dto.RideIdRequest;
import com.uberclone.backend.application.service.CaptainLocationService;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Location;
import com.uberclone.backend.model.Ride;
import com.uberclone.backend.model.User;
import com.uberclone.backend.service.AuthService;
import com.uberclone.backend.service.MapService;
import com.uberclone.backend.service.RideService;
import com.uberclone.backend.service.SocketIoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/rides")
public class RideController {
    private final RideService rideService;
    private final MapService mapService;
    private final AuthService authService;
    private final SocketIoService socketIoService;
    private final CaptainLocationService captainLocationService;

    public RideController(RideService rideService,
                          MapService mapService,
                          AuthService authService,
                          SocketIoService socketIoService,
                          CaptainLocationService captainLocationService) {
        this.rideService = rideService;
        this.mapService = mapService;
        this.authService = authService;
        this.socketIoService = socketIoService;
        this.captainLocationService = captainLocationService;
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    Ride createRide(@Valid @RequestBody CreateRideRequest request, HttpServletRequest httpRequest) {
        User user = authService.requireUser(httpRequest);
        Ride ride = rideService.createRide(user, request);
        Ride rideWithUser = rideService.populate(ride, false);

        // Best-effort: notify nearby captains. If Maps API is unavailable, broadcast to all online captains.
        try {
            Location pickupCoordinates = mapService.getAddressCoordinate(request.getPickup());
            captainLocationService.findCaptainsNear(pickupCoordinates, 2)
                    .forEach(captain -> socketIoService.sendMessageToSocketId(captain.getSocketId(), "new-ride", rideWithUser));
        } catch (Exception e) {
            // Maps geocoding failed — fall back to broadcasting to all captains with a socket ID
            captainLocationService.findAllOnlineCaptains()
                    .forEach(captain -> socketIoService.sendMessageToSocketId(captain.getSocketId(), "new-ride", rideWithUser));
        }

        return ride;
    }

    @GetMapping("/get-fare")
    Map<String, Integer> getFare(@RequestParam @Size(min = 3, message = "Invalid pickup address") String pickup,
                                 @RequestParam @Size(min = 3, message = "Invalid destination address") String destination,
                                 HttpServletRequest request) {
        authService.requireUser(request);
        return rideService.getFare(pickup, destination);
    }

    @PostMapping("/confirm")
    Ride confirmRide(@Valid @RequestBody RideIdRequest request, HttpServletRequest httpRequest) {
        Captain captain = authService.requireCaptain(httpRequest);
        Ride ride = rideService.confirmRide(request.getRideId(), captain);
        if (ride.getUser() != null) {
            socketIoService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-confirmed", ride);
        }
        return ride;
    }

    @GetMapping("/start-ride")
    Ride startRide(@RequestParam String rideId,
                   @RequestParam @Size(min = 6, max = 6, message = "Invalid OTP") String otp,
                   HttpServletRequest httpRequest) {
        Captain captain = authService.requireCaptain(httpRequest);
        Ride ride = rideService.startRide(rideId, otp, captain);
        if (ride.getUser() != null) {
            socketIoService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-started", ride);
        }
        return ride;
    }

    @PostMapping("/end-ride")
    Ride endRide(@Valid @RequestBody RideIdRequest request, HttpServletRequest httpRequest) {
        Captain captain = authService.requireCaptain(httpRequest);
        Ride ride = rideService.endRide(request.getRideId(), captain);
        if (ride.getUser() != null) {
            socketIoService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-ended", ride);
        }
        return ride;
    }

    @PostMapping("/rate")
    Ride rateRide(@Valid @RequestBody com.uberclone.backend.dto.RateRequest request, HttpServletRequest httpRequest) {
        User user = authService.requireUser(httpRequest);
        return rideService.rateRide(request.getRideId(), request.getRating(), user);
    }

    @GetMapping("/user-history")
    List<Ride> getUserHistory(HttpServletRequest httpRequest) {
        User user = authService.requireUser(httpRequest);
        return rideService.getUserRides(user);
    }

    @GetMapping("/captain-history")
    List<Ride> getCaptainHistory(HttpServletRequest httpRequest) {
        Captain captain = authService.requireCaptain(httpRequest);
        return rideService.getCaptainRides(captain);
    }
}

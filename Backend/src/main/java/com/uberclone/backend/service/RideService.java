package com.uberclone.backend.service;

import com.uberclone.backend.dto.CreateRideRequest;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Ride;
import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.CaptainRepository;
import com.uberclone.backend.repository.RideRepository;
import com.uberclone.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final CaptainRepository captainRepository;
    private final MapService mapService;
    private final SecureRandom secureRandom = new SecureRandom();

    public RideService(RideRepository rideRepository,
                       UserRepository userRepository,
                       CaptainRepository captainRepository,
                       MapService mapService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.captainRepository = captainRepository;
        this.mapService = mapService;
    }

    public Map<String, Integer> getFare(String pickup, String destination) {
        try {
            Map<String, Object> distanceTime = mapService.getDistanceTime(pickup, destination);
            Map<String, Object> distance = castMap(distanceTime.get("distance"));
            Map<String, Object> duration = castMap(distanceTime.get("duration"));
            double meters = asDouble(distance.get("value"));
            double seconds = asDouble(duration.get("value"));
            return Map.of(
                    "auto", fare(30, 10, 2, meters, seconds),
                    "car", fare(50, 15, 3, meters, seconds),
                    "moto", fare(20, 8, 1.5, meters, seconds)
            );
        } catch (Exception e) {
            // Fallback flat fares when Maps API is unavailable
            return Map.of("auto", 80, "car", 150, "moto", 50);
        }
    }

    public Ride createRide(User user, CreateRideRequest request) {
        Ride ride = new Ride();
        ride.setUserId(user.getId());
        ride.setPickup(request.getPickup());
        ride.setDestination(request.getDestination());
        
        Integer rideFare = 100;
        try {
            Map<String, Object> distanceTime = mapService.getDistanceTime(request.getPickup(), request.getDestination());
            
            if (distanceTime.containsKey("originLat")) {
                ride.setPickupLat((Double) distanceTime.get("originLat"));
                ride.setPickupLng((Double) distanceTime.get("originLng"));
                ride.setDestLat((Double) distanceTime.get("destLat"));
                ride.setDestLng((Double) distanceTime.get("destLng"));
            }
            
            Map<String, Object> distance = castMap(distanceTime.get("distance"));
            Map<String, Object> duration = castMap(distanceTime.get("duration"));
            double meters = asDouble(distance.get("value"));
            double seconds = asDouble(duration.get("value"));
            
            if ("auto".equals(request.getVehicleType())) {
                rideFare = fare(30, 10, 2, meters, seconds);
            } else if ("moto".equals(request.getVehicleType())) {
                rideFare = fare(20, 8, 1.5, meters, seconds);
            } else {
                rideFare = fare(50, 15, 3, meters, seconds);
            }
        } catch (Exception e) {
            // Fallback flat fares when Maps API is unavailable
            if ("auto".equals(request.getVehicleType())) rideFare = 80;
            else if ("moto".equals(request.getVehicleType())) rideFare = 50;
            else rideFare = 150;
        }
        
        ride.setFare(rideFare);
        ride.setOtp(generateOtp());
        return rideRepository.save(ride);
    }

    public Ride confirmRide(String rideId, Captain captain) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus("accepted");
        ride.setCaptainId(captain.getId());
        rideRepository.save(ride);
        return populate(ride, true);
    }

    public Ride startRide(String rideId, String otp, Captain captain) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!"accepted".equals(ride.getStatus())) {
            throw new RuntimeException("Ride not accepted");
        }
        if (!ride.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        ride.setStatus("ongoing");
        rideRepository.save(ride);
        return populate(ride, true);
    }

    public Ride endRide(String rideId, Captain captain) {
        Ride ride = rideRepository.findByIdAndCaptainId(rideId, captain.getId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!"ongoing".equals(ride.getStatus())) {
            throw new RuntimeException("Ride not ongoing");
        }
        ride.setStatus("completed");
        rideRepository.save(ride);

        captain.setRidesCompleted(captain.getRidesCompleted() + 1);
        captain.setTotalEarnings(captain.getTotalEarnings() + ride.getFare());
        captainRepository.save(captain);

        return populate(ride, true);
    }

    public Ride rateRide(String rideId, int rating, User user) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        
        if (!ride.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (!"completed".equals(ride.getStatus())) {
            throw new RuntimeException("Ride must be completed to rate");
        }

        Captain captain = captainRepository.findById(ride.getCaptainId())
                .orElseThrow(() -> new RuntimeException("Captain not found"));

        int totalRides = captain.getRidesCompleted();
        // Since ridesCompleted was already incremented in endRide, 
        // total points = old_average * (totalRides - 1) + new_rating
        // new average = total points / totalRides
        if (totalRides > 0) {
            double currentAverage = captain.getRating() != null ? captain.getRating() : 5.0;
            double oldTotalPoints = currentAverage * (totalRides - 1);
            double newAverage = (oldTotalPoints + rating) / totalRides;
            
            // Round to 1 decimal place
            newAverage = Math.round(newAverage * 10.0) / 10.0;
            captain.setRating(newAverage);
        } else {
            captain.setRating((double) rating);
        }
        
        captainRepository.save(captain);
        return populate(ride, false);
    }

    public List<Ride> getUserRides(User user) {
        return rideRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(ride -> populate(ride, false))
                .toList();
    }

    public List<Ride> getCaptainRides(Captain captain) {
        return rideRepository.findByCaptainIdOrderByIdDesc(captain.getId()).stream()
                .map(ride -> populate(ride, false))
                .toList();
    }

    public Ride populate(Ride ride, boolean includeOtp) {
        if (ride.getUserId() != null) {
            userRepository.findById(ride.getUserId()).ifPresent(ride::setUser);
        }
        if (ride.getCaptainId() != null) {
            captainRepository.findById(ride.getCaptainId()).ifPresent(ride::setCaptain);
        }
        if (!includeOtp) {
            ride.setOtp(null);
        }
        return ride;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object value) {
        return (Map<String, Object>) value;
    }

    private double asDouble(Object value) {
        return ((Number) value).doubleValue();
    }

    private int fare(double base, double perKm, double perMinute, double meters, double seconds) {
        return (int) Math.round(base + (meters / 1000 * perKm) + (seconds / 60 * perMinute));
    }

    private String generateOtp() {
        return String.valueOf(secureRandom.nextInt(900000) + 100000);
    }
}

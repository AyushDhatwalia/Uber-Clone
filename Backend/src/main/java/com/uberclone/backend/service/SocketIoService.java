package com.uberclone.backend.service;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import com.uberclone.backend.application.service.CaptainLocationService;
import com.uberclone.backend.dto.CaptainLocationRequest;
import com.uberclone.backend.dto.SocketJoinRequest;
import com.uberclone.backend.model.Location;
import com.uberclone.backend.repository.CaptainRepository;
import com.uberclone.backend.repository.UserRepository;
import com.uberclone.backend.repository.RideRepository;
import com.uberclone.backend.model.Ride;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SocketIoService {
    private final UserRepository userRepository;
    private final CaptainRepository captainRepository;
    private final RideRepository rideRepository;
    private final CaptainLocationService captainLocationService;
    private final String host;
    private final int port;
    private SocketIOServer server;

    public SocketIoService(UserRepository userRepository,
                           CaptainRepository captainRepository,
                           RideRepository rideRepository,
                           CaptainLocationService captainLocationService,
                           @Value("${app.socketio.host}") String host,
                           @Value("${app.socketio.port}") int port) {
        this.userRepository = userRepository;
        this.captainRepository = captainRepository;
        this.rideRepository = rideRepository;
        this.captainLocationService = captainLocationService;
        this.host = host;
        this.port = port;
    }

    @PostConstruct
    void start() {
        Configuration configuration = new Configuration();
        configuration.setHostname(host);
        configuration.setPort(port);
        configuration.setOrigin("*");
        server = new SocketIOServer(configuration);

        server.addEventListener("join", SocketJoinRequest.class, (client, data, ackSender) -> {
            if ("user".equals(data.getUserType())) {
                userRepository.findById(data.getUserId()).ifPresent(user -> {
                    user.setSocketId(client.getSessionId().toString());
                    userRepository.save(user);
                });
            } else if ("captain".equals(data.getUserType())) {
                captainRepository.findById(data.getUserId()).ifPresent(captain -> {
                    captain.setSocketId(client.getSessionId().toString());
                    captainRepository.save(captain);
                });
            }
        });

        server.addEventListener("update-location-captain", CaptainLocationRequest.class, (client, data, ackSender) -> {
            Location location = data.getLocation();
            if (location == null || location.getLtd() == null || location.getLng() == null) {
                client.sendEvent("error", java.util.Map.of("message", "Invalid location data"));
                return;
            }
            captainLocationService.updateCaptainLocation(data.getUserId(), location);

            // Forward location to user if there's an active ride
            java.util.List<Ride> rides = rideRepository.findByCaptainIdOrderByIdDesc(data.getUserId());
            rides.stream()
                 .filter(r -> "accepted".equals(r.getStatus()) || "ongoing".equals(r.getStatus()))
                 .findFirst()
                 .ifPresent(ride -> {
                     if (ride.getUser() != null && ride.getUser().getSocketId() != null) {
                         sendMessageToSocketId(ride.getUser().getSocketId(), "captain-location-update", location);
                     }
                 });
        });

        server.start();
    }

    @PreDestroy
    void stop() {
        if (server != null) {
            server.stop();
        }
    }

    public void sendMessageToSocketId(String socketId, String event, Object data) {
        if (socketId == null || server == null) {
            return;
        }
        server.getAllClients().stream()
                .filter(client -> socketId.equals(client.getSessionId().toString()))
                .findFirst()
                .ifPresent(client -> client.sendEvent(event, data));
    }
}

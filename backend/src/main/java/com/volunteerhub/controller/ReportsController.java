package com.volunteerhub.controller;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.SupportTicket;
import com.volunteerhub.model.User;
import com.volunteerhub.service.EventService;
import com.volunteerhub.service.SupportTicketService;
import com.volunteerhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class ReportsController {

    private final UserService userService;
    private final EventService eventService;
    private final SupportTicketService supportTicketService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<User> users = userService.getAllUsers();
        List<Event> events = eventService.getAllEvents();
        List<SupportTicket> tickets = supportTicketService.getAllTickets();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("totalEvents", events.size());
        stats.put("totalTickets", tickets.size());
        stats.put("totalVolunteers", users.stream().filter(u -> u.getRole() == User.Role.VOLUNTEER).count());
        stats.put("totalOrganizers", users.stream().filter(u -> u.getRole() == User.Role.ORGANIZER).count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/charts-data")
    public ResponseEntity<Map<String, Object>> getChartsData() {
        List<User> users = userService.getAllUsers();
        // ... existing implementation ...
        List<Event> events = eventService.getAllEvents();
        List<SupportTicket> tickets = supportTicketService.getAllTickets();

        Map<String, Object> data = new HashMap<>();

        // User Roles Distribution
        Map<String, Long> userRoles = users.stream()
                .collect(Collectors.groupingBy(u -> u.getRole().toString(), Collectors.counting()));
        data.put("userRoles", userRoles);

        // Event Status Distribution
        Map<String, Long> eventStatus = events.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().toString(), Collectors.counting()));
        data.put("eventStatus", eventStatus);

        // Ticket Status Distribution
        Map<String, Long> ticketStatus = tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().toString(), Collectors.counting()));
        data.put("ticketStatus", ticketStatus);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/organizer-stats")
    public ResponseEntity<Map<String, Object>> getOrganizerStats(
            @org.springframework.web.bind.annotation.RequestParam Long organizerId) {
        List<Event> events = eventService.getEventsByOrganizer(organizerId);

        Map<String, Object> stats = new HashMap<>();

        // 1. Event Status Distribution
        Map<String, Long> eventStatus = events.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().toString(), Collectors.counting()));
        stats.put("eventStatus", eventStatus);

        // 2. Volunteer Stats (Aggregated across all events)
        long totalVolunteers = 0;
        long pendingRequests = 0;
        long approvedVolunteers = 0;

        for (Event event : events) {
            List<com.volunteerhub.model.EventVolunteer> volunteers = eventService.getEventVolunteers(event.getId());
            totalVolunteers += volunteers.size();
            pendingRequests += volunteers.stream().filter(v -> v.getStatus().toString().equals("PENDING")).count();
            approvedVolunteers += volunteers.stream().filter(
                    v -> v.getStatus().toString().equals("APPROVED") || v.getStatus().toString().equals("ATTENDED"))
                    .count();
        }

        stats.put("totalEvents", events.size());
        stats.put("totalVolunteers", totalVolunteers);
        stats.put("pendingRequests", pendingRequests);
        stats.put("approvedVolunteers", approvedVolunteers);

        return ResponseEntity.ok(stats);
    }
}

package com.volunteerhub.controller;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.UserRepository;  // ✅ ADD THIS IMPORT
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;  // ✅ FIXED: Proper injection

    // ✅ EXISTING ENDPOINTS (Keep these)
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody @Valid Event event,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.createEvent(event, userId));
    }

    @GetMapping("/myevents")
    public ResponseEntity<List<Event>> getMyEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(userId));
    }

    @GetMapping("/published")
    public ResponseEntity<List<Event>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody @Valid Event event,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.updateEvent(id, event, userId));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Event> publishEvent(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(eventService.publishEvent(id, userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Event> completeEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.completeEvent(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {
        eventService.deleteEvent(id, userId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<Map<String, String>> registerVolunteer(
            @PathVariable Long id,
            @RequestParam Long userId) {
        eventService.registerVolunteer(id, userId);
        return ResponseEntity.ok(Map.of("message", "Applied successfully"));
    }

    @GetMapping("/volunteer/myevents")
    public ResponseEntity<List<Event>> getVolunteerEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByVolunteer(userId));
    }

    // 🔥 NEW ADMIN ENDPOINTS FOR DASHBOARD COUNTS
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEventStats() {
        return ResponseEntity.ok(Map.of(
                "totalEvents", eventService.getTotalEventsCount(),
                "pendingEvents", eventService.getPendingEventsCount()
        ));
    }

    @GetMapping(params = "status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Event>> getEventsByStatus(@RequestParam String status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    // ✅ FIXED VOLUNTEER COUNT ENDPOINT
    @GetMapping("/admin/volunteers/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTotalVolunteersCount() {
        return ResponseEntity.ok((Long) eventService.getTotalVolunteerRegistrations());
    }

    // ✅ FIXED USERS ENDPOINT
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());  // ✅ Now works!
    }


    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteEventAdmin(@PathVariable Long id) {
        eventService.deleteEventAdmin(id);
        return ResponseEntity.ok("Event deleted successfully");
    }



    @GetMapping("/events/myevents/{id}")
    public ResponseEntity<Event> getMyEvent(@PathVariable Long id,
                                            @RequestParam(required = false) String userId) {
        // Only return if organizer owns event
        Event event = eventService.findByIdAndOrganizer(id, userId);
        return event != null ? ResponseEntity.ok(event) : ResponseEntity.notFound().build();
    }

}

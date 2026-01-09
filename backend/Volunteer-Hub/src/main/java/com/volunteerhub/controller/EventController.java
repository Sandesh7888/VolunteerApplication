package com.volunteerhub.controller;

import com.volunteerhub.model.Event;
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ✅ CREATE EVENT
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody @Valid Event event,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(eventService.createEvent(event, userId));
    }

    // ✅ FIXED: GET MY EVENTS (Added ResponseEntity)
    @GetMapping("/myevents")
    public ResponseEntity<List<Event>> getMyEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(userId));
    }

    // ✅ FIXED: GET PUBLISHED EVENTS (Added ResponseEntity)
    @GetMapping("/published")
    public ResponseEntity<List<Event>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    // ✅ FIXED: UPDATE EVENT (Added ResponseEntity)
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody @Valid Event event,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(eventService.updateEvent(id, event, userId));
    }

    // ✅ FIXED: PUBLISH EVENT (Added ResponseEntity)
    @PatchMapping("/{id}/publish")
    public ResponseEntity<Event> publishEvent(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(eventService.publishEvent(id, userId));
    }

    // ✅ FIXED: COMPLETE EVENT (Added ResponseEntity)
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Event> completeEvent(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(eventService.completeEvent(id, userId));
    }

    // ✅ FIXED: DELETE EVENT (Already good)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        eventService.deleteEvent(id, userId);
        return ResponseEntity.ok("Event deleted successfully");
    }
}

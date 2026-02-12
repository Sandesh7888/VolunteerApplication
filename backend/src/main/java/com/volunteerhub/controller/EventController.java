package com.volunteerhub.controller;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<?> createEvent(
            @RequestBody Map<String, Object> requestData,
            @RequestParam(required = false) Long userId) {
        try {
            System.out.println("📥 RAW DATA RECEIVED: " + requestData);
            System.out.println("📥 QUERY PARAM userId: " + userId);

            // 1. Resolve User ID
            Long finalUserId = userId; // try param first
            if (requestData.containsKey("userId") && requestData.get("userId") != null) {
                finalUserId = parseLong(requestData.get("userId"));
            }

            if (finalUserId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: userId is required"));
            }

            // Create Event object manually
            Event event = new Event();
            event.setTitle((String) requestData.get("title"));
            event.setCategory((String) requestData.get("category"));
            event.setLocationName((String) requestData.get("locationName"));
            event.setDescription((String) requestData.get("description"));

            event.setCity((String) requestData.get("city"));
            event.setAddress((String) requestData.get("address"));
            event.setArea((String) requestData.get("area"));
            event.setRequiredVolunteers(parseInteger(requestData.get("requiredVolunteers")));

            // Handle Date and Time parsing
            String startDateStr = (String) requestData.get("startDate");
            String endDateStr = (String) requestData.get("endDate");
            String startTimeStr = (String) requestData.get("startTime");
            String endTimeStr = (String) requestData.get("endTime");

            if (startDateStr != null && !startDateStr.isEmpty()) {
                event.setStartDate(LocalDate.parse(startDateStr));
            }
            if (endDateStr != null && !endDateStr.isEmpty()) {
                event.setEndDate(LocalDate.parse(endDateStr));
            }
            if (startTimeStr != null && !startTimeStr.isEmpty()) {
                event.setStartTime(LocalTime.parse(startTimeStr));
            }
            if (endTimeStr != null && !endTimeStr.isEmpty()) {
                event.setEndTime(LocalTime.parse(endTimeStr));
            }

            // Populate dateTime (Critical for DB)
            if (event.getStartDate() != null) {
                if (event.getStartTime() != null) {
                    event.setDateTime(LocalDateTime.of(event.getStartDate(), event.getStartTime()));
                } else {
                    event.setDateTime(event.getStartDate().atStartOfDay());
                }
            }

            // Optional fields
            if (requestData.get("skillsRequired") != null)
                event.setSkillsRequired((String) requestData.get("skillsRequired"));
            if (requestData.get("minAge") != null)
                event.setMinAge(parseInteger(requestData.get("minAge")));
            if (requestData.get("genderPreference") != null)
                event.setGenderPreference((String) requestData.get("genderPreference"));

            // Handle Registration Date and Time - Robustly
            try {
                String regOpenStr = (String) requestData.get("registrationOpenDateTime");
                String regCloseStr = (String) requestData.get("registrationCloseDateTime");

                if (regOpenStr != null && regOpenStr.length() >= 16) {
                    event.setRegistrationOpenDateTime(LocalDateTime.parse(regOpenStr.substring(0, 19)));
                }
                if (regCloseStr != null && regCloseStr.length() >= 16) {
                    event.setRegistrationCloseDateTime(LocalDateTime.parse(regCloseStr.substring(0, 19)));
                }
            } catch (Exception e) {
                System.err.println("⚠️ Registration date parsing failed: " + e.getMessage());
            }

            System.out.println("✅ CREATING EVENT for userId: " + finalUserId);
            Event savedEvent = eventService.createEvent(event, finalUserId);

            // ✅ Force populate transient fields for immediate response
            savedEvent.populateTransientFields();

            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    private Integer parseInteger(Object obj) {
        if (obj == null)
            return null;
        if (obj instanceof Number)
            return ((Number) obj).intValue();
        try {
            return Integer.parseInt(obj.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long parseLong(Object obj) {
        if (obj == null)
            return null;
        if (obj instanceof Number)
            return ((Number) obj).longValue();
        try {
            return Long.parseLong(obj.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/myevents")
    public ResponseEntity<List<Event>> getMyEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(userId));
    }

    @GetMapping("/published")
    public ResponseEntity<List<Event>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Event>> getAvailableEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @RequestParam Long userId) {
        System.out.println("📡 CONTROLLER: Body - StartDate: " + event.getStartDate());
        Event updatedEvent = eventService.updateEvent(id, event, userId);
        updatedEvent.populateTransientFields();
        return ResponseEntity.ok(updatedEvent);
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Event> publishEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {
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

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Event> cancelEvent(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String reason) {
        return ResponseEntity.ok(eventService.cancelEvent(id, userId, reason));
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        System.out.println("📡 FETCHING EVENT DETAILS: " + id);
        Event event = eventService.getEventById(id);
        if (event != null)
            event.populateTransientFields();
        return ResponseEntity.ok(event);
    }

    @GetMapping("/{id}/volunteers")
    public ResponseEntity<List<EventVolunteer>> getEventVolunteers(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventVolunteers(id));
    }
}
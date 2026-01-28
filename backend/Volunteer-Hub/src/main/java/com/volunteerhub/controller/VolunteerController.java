package com.volunteerhub.controller;

import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.service.EventVolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@CrossOrigin
public class VolunteerController {
    private final EventVolunteerService eventVolunteerService;

    // Volunteer joins event
    @PostMapping("/join/{eventId}")
    public ResponseEntity<EventVolunteer> joinEvent(@PathVariable Long eventId, @RequestParam Long volunteerId) {
        return ResponseEntity.ok(eventVolunteerService.joinEvent(eventId, volunteerId));
    }

    // Get volunteer history
    @GetMapping("/history")
    public ResponseEntity<List<EventVolunteer>> getVolunteerHistory(@RequestParam Long volunteerId) {
        return ResponseEntity.ok(eventVolunteerService.getVolunteerHistory(volunteerId));
    }

    // Organizer approves volunteer
    @PatchMapping("/{id}/approve")
    public ResponseEntity<EventVolunteer> approveVolunteer(
            @PathVariable Long id,
            @RequestParam Long organizerId) {
        return ResponseEntity.ok(eventVolunteerService.approveVolunteer(id, organizerId));
    }

    // Organizer rejects volunteer
    @PatchMapping("/{id}/reject")
    public ResponseEntity<EventVolunteer> rejectVolunteer(
            @PathVariable Long id,
            @RequestParam Long organizerId,
            @RequestParam(required = false, defaultValue = "Not suitable") String reason) {
        return ResponseEntity.ok(eventVolunteerService.rejectVolunteer(id, organizerId, reason));
    }

    // Organizer marks attendance
    @PatchMapping("/{id}/attendance")
    public ResponseEntity<EventVolunteer> markAttendance(
            @PathVariable Long id,
            @RequestParam Long organizerId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date,
            @RequestParam boolean attended) {
        return ResponseEntity.ok(eventVolunteerService.markAttendance(id, organizerId, date, attended));
    }

    // Organizer removes volunteer
    @PatchMapping("/{id}/remove")
    public ResponseEntity<Void> removeVolunteer(
            @PathVariable Long id,
            @RequestParam Long organizerId) {
        eventVolunteerService.removeVolunteer(id, organizerId);
        return ResponseEntity.ok().build();
    }

    // Volunteer cancels own request
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRequest(
            @PathVariable Long id,
            @RequestParam Long volunteerId) {
        eventVolunteerService.cancelRequest(id, volunteerId);
        return ResponseEntity.ok().build();
    }
}
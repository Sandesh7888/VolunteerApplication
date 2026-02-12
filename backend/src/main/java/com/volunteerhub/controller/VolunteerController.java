package com.volunteerhub.controller;

import com.volunteerhub.dto.EventFeedbackDTO;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.Feedback;
import com.volunteerhub.service.EventVolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@CrossOrigin
public class VolunteerController {
    private final EventVolunteerService eventVolunteerService;
    private final com.volunteerhub.service.FileStorageService fileStorageService;

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

    // Submit feedback
    @PostMapping("/{id}/feedback")
    public ResponseEntity<Feedback> submitFeedback(
            @PathVariable Long id,
            @RequestParam Long volunteerId,
            @RequestBody EventFeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(eventVolunteerService.submitFeedback(id, volunteerId, feedbackDTO.getFeedback(),
                feedbackDTO.getRating()));
    }

    // Update feedback
    @PatchMapping("/feedback/{feedbackId}")
    public ResponseEntity<Feedback> updateFeedback(
            @PathVariable Long feedbackId,
            @RequestParam Long volunteerId,
            @RequestBody EventFeedbackDTO feedbackDTO) {
        return ResponseEntity
                .ok(eventVolunteerService.updateFeedback(feedbackId, volunteerId, feedbackDTO.getFeedback(),
                        feedbackDTO.getRating()));
    }

    // Delete feedback
    @DeleteMapping("/feedback/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable Long feedbackId,
            @RequestParam Long volunteerId) {
        eventVolunteerService.deleteFeedback(feedbackId, volunteerId);
        return ResponseEntity.ok().build();
    }

    // Moderate feedback (Organizer deletion)
    @DeleteMapping("/feedback/{feedbackId}/moderate")
    public ResponseEntity<Void> moderateFeedback(
            @PathVariable Long feedbackId,
            @RequestParam Long organizerId) {
        eventVolunteerService.deleteFeedbackByOrganizer(feedbackId, organizerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/certificate")
    public ResponseEntity<EventVolunteer> issueCertificate(
            @PathVariable Long id,
            @RequestParam Long organizerId,
            @RequestParam String certificateUrl) {
        return ResponseEntity.ok(eventVolunteerService.issueCertificate(id, organizerId, certificateUrl));
    }

    // Upload certificate file
    @PostMapping("/{id}/upload-certificate")
    public ResponseEntity<?> uploadCertificate(
            @PathVariable Long id,
            @RequestParam Long organizerId,
            @RequestParam("file") MultipartFile file) {
        try {
            EventVolunteer updated = eventVolunteerService.issueCertificateWithFile(id, organizerId, file);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Download certificate
    @GetMapping("/certificate/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadCertificate(@PathVariable String fileName) {
        try {
            String fullPath = "certificates/" + fileName;
            Resource resource = fileStorageService.loadFileAsResource(fullPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/pdf"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

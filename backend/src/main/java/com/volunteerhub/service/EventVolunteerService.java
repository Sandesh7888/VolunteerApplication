package com.volunteerhub.service;

import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.Feedback;
import java.time.LocalDate;
import java.util.List;

public interface EventVolunteerService {
    EventVolunteer joinEvent(Long eventId, Long volunteerId);

    EventVolunteer approveVolunteer(Long eventVolunteerId, Long organizerId);

    EventVolunteer rejectVolunteer(Long eventVolunteerId, Long organizerId, String reason);

    void removeVolunteer(Long eventVolunteerId, Long organizerId);

    List<EventVolunteer> getEventVolunteers(Long eventId);

    List<EventVolunteer> getVolunteerHistory(Long volunteerId);

    List<EventVolunteer> getOrganizerVolunteerRequests(Long organizerId);

    EventVolunteer markAttendance(Long eventVolunteerId, Long organizerId, LocalDate date, boolean attended);

    void cancelRequest(Long eventVolunteerId, Long volunteerId);

    // Submit feedback
    Feedback submitFeedback(Long eventVolunteerId, Long volunteerId, String comment, Integer rating);

    // Update feedback
    Feedback updateFeedback(Long feedbackId, Long volunteerId, String comment, Integer rating);

    // Delete feedback
    void deleteFeedback(Long feedbackId, Long volunteerId);

    // Moderate feedback (Organizer deletion)
    void deleteFeedbackByOrganizer(Long feedbackId, Long organizerId);

    EventVolunteer issueCertificate(Long eventVolunteerId, Long organizerId, String certificateUrl);

    EventVolunteer issueCertificateWithFile(Long eventVolunteerId, Long organizerId,
            org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
}

package com.volunteerhub.service.impl;

import com.volunteerhub.model.*;
import com.volunteerhub.repository.AttendanceRepository;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.EventVolunteerRepository;
import com.volunteerhub.repository.FeedbackRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.EventVolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventVolunteerServiceImpl implements EventVolunteerService {

    private final EventVolunteerRepository eventVolunteerRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeedbackRepository feedbackRepository;
    private final com.volunteerhub.service.EmailService emailService;
    private final com.volunteerhub.service.NotificationService notificationService;
    private final com.volunteerhub.service.FileStorageService fileStorageService;

    @Override
    public EventVolunteer joinEvent(Long eventId, Long volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        if (eventVolunteerRepository.existsByEventAndVolunteer(event, volunteer)) {
            throw new RuntimeException("Already joined this event");
        }

        if (event.getStatus() != Event.EventStatus.PUBLISHED) {
            throw new RuntimeException("Cannot join non-published events");
        }

        // ✅ CHECK REGISTRATION WINDOW
        LocalDateTime now = LocalDateTime.now();
        if (event.getRegistrationOpenDateTime() != null && now.isBefore(event.getRegistrationOpenDateTime())) {
            throw new RuntimeException("Registration for this event has not opened yet");
        }
        if (event.getRegistrationCloseDateTime() != null && now.isAfter(event.getRegistrationCloseDateTime())) {
            throw new RuntimeException("Registration for this event is closed");
        }

        EventVolunteer eventVolunteer = EventVolunteer.builder()
                .event(event)
                .volunteer(volunteer)
                .status(EventVolunteer.VolunteerStatus.PENDING)
                .joinedAt(LocalDateTime.now())
                .build();

        event.setCurrentVolunteers(event.getCurrentVolunteers() + 1);
        eventRepository.save(event);

        EventVolunteer saved = eventVolunteerRepository.save(eventVolunteer);
        emailService.sendEventJoinRequestEmail(volunteer, event);

        // Notify Volunteer
        notificationService.createNotification(
                volunteer,
                "Application Submitted",
                "Your application for '" + event.getTitle() + "' has been submitted.",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        // Notify Organizer
        notificationService.createNotification(
                event.getOrganizer(),
                "New Join Request",
                volunteer.getName() + " has requested to join '" + event.getTitle() + "'.",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        return saved;
    }

    @Override
    public EventVolunteer approveVolunteer(Long eventVolunteerId, Long organizerId) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer request not found"));

        Event event = ev.getEvent();
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        ev.setStatus(EventVolunteer.VolunteerStatus.APPROVED);
        ev.setApprovedAt(LocalDateTime.now());
        EventVolunteer savedEv = eventVolunteerRepository.save(ev);
        // emailService.sendEventJoinAcceptedEmail(savedEv.getVolunteer(),
        // savedEv.getEvent());
        notificationService.createNotification(
                savedEv.getVolunteer(),
                "Application Approved",
                "Your request to join the event '" + savedEv.getEvent().getTitle() + "' has been approved!",
                Notification.NotificationType.SUCCESS);
        return savedEv;
    }

    @Override
    public EventVolunteer rejectVolunteer(Long eventVolunteerId, Long organizerId, String reason) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer request not found"));

        Event event = ev.getEvent();
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        ev.setStatus(EventVolunteer.VolunteerStatus.REJECTED);
        ev.setRejectionReason(reason);
        EventVolunteer saved = eventVolunteerRepository.save(ev);
        emailService.sendEventJoinRejectedEmail(saved.getVolunteer(), saved.getEvent(), reason);

        notificationService.createNotification(
                saved.getVolunteer(),
                "Application Rejected",
                "Your application for '" + saved.getEvent().getTitle() + "' was not approved.",
                com.volunteerhub.model.Notification.NotificationType.ERROR);

        return saved;
    }

    @Override
    public void removeVolunteer(Long eventVolunteerId, Long organizerId) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        Event event = ev.getEvent();
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        ev.setStatus(EventVolunteer.VolunteerStatus.REMOVED);
        EventVolunteer saved = eventVolunteerRepository.save(ev);
        emailService.sendEventJoinRejectedEmail(saved.getVolunteer(), saved.getEvent(),
                "You have been removed from this event by the organizer.");

        notificationService.createNotification(
                saved.getVolunteer(),
                "Removed from Event",
                "You have been removed from '" + saved.getEvent().getTitle() + "' by the organizer.",
                com.volunteerhub.model.Notification.NotificationType.WARNING);
    }

    @Override
    public List<EventVolunteer> getEventVolunteers(Long eventId) {
        return eventVolunteerRepository.findByEventIdWithDetails(eventId);
    }

    @Override
    public List<EventVolunteer> getVolunteerHistory(Long volunteerId) {
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));
        return eventVolunteerRepository.findByVolunteer(volunteer);
    }

    @Override
    public List<EventVolunteer> getOrganizerVolunteerRequests(Long organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return eventRepository.findByOrganizer(organizer).stream()
                .flatMap(event -> eventVolunteerRepository
                        .findByEventAndStatus(event, EventVolunteer.VolunteerStatus.PENDING).stream())
                .toList();
    }

    @Override
    public EventVolunteer markAttendance(Long eventVolunteerId, Long organizerId, LocalDate date, boolean attended) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer request not found"));

        if (!ev.getEvent().getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: Only the event organizer can mark attendance");
        }

        // Find existing attendance for this date or create new
        Attendance attendance = attendanceRepository.findByEventVolunteerAndDate(ev, date)
                .orElse(Attendance.builder()
                        .eventVolunteer(ev)
                        .date(date)
                        .build());

        attendance.setStatus(attended ? Attendance.AttendanceStatus.PRESENT : Attendance.AttendanceStatus.ABSENT);
        attendanceRepository.save(attendance);

        if (attended) {
            ev.setStatus(EventVolunteer.VolunteerStatus.ATTENDED);

            // Award Points (e.g., 50 points per day attended)
            User volunteer = ev.getVolunteer();
            volunteer.setPoints((volunteer.getPoints() != null ? volunteer.getPoints() : 0) + 50);
            userRepository.save(volunteer);
        }

        return eventVolunteerRepository.save(ev);
    }

    @Override
    public void cancelRequest(Long eventVolunteerId, Long volunteerId) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer request not found"));

        if (!ev.getVolunteer().getId().equals(volunteerId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own request");
        }

        Event event = ev.getEvent();
        if (ev.getStatus() == EventVolunteer.VolunteerStatus.APPROVED
                || ev.getStatus() == EventVolunteer.VolunteerStatus.PENDING) {
            event.setCurrentVolunteers(Math.max(0, event.getCurrentVolunteers() - 1));
            eventRepository.save(event);
        }

        eventVolunteerRepository.delete(ev);
    }

    @Override
    public Feedback submitFeedback(Long eventVolunteerId, Long volunteerId, String comment, Integer rating) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer registration not found"));

        if (!ev.getVolunteer().getId().equals(volunteerId)) {
            throw new RuntimeException("Unauthorized: You can only submit feedback for your own registration");
        }

        Feedback feedback = Feedback.builder()
                .eventVolunteer(ev)
                .comment(comment)
                .rating(rating)
                .createdAt(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }

    @Override
    public Feedback updateFeedback(Long feedbackId, Long volunteerId, String comment, Integer rating) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getEventVolunteer().getVolunteer().getId().equals(volunteerId)) {
            throw new RuntimeException("Unauthorized: You can only update your own feedback");
        }

        feedback.setComment(comment);
        feedback.setRating(rating);
        return feedbackRepository.save(feedback);
    }

    @Override
    public void deleteFeedback(Long feedbackId, Long volunteerId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getEventVolunteer().getVolunteer().getId().equals(volunteerId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own feedback");
        }

        feedbackRepository.delete(feedback);
    }

    @Override
    public void deleteFeedbackByOrganizer(Long feedbackId, Long organizerId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Check if the requester is the organizer of the event
        if (!feedback.getEventVolunteer().getEvent().getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: Only the event organizer can moderate feedback");
        }

        feedbackRepository.delete(feedback);
    }

    @Override
    public EventVolunteer issueCertificate(Long eventVolunteerId, Long organizerId, String certificateUrl) {
        EventVolunteer ev = eventVolunteerRepository.findById(eventVolunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer registration not found"));

        if (!ev.getEvent().getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: Only the event organizer can issue certificates");
        }

        // Calculate attendance percentage
        long totalRecords = ev.getAttendanceRecords().size();
        long presentRecords = ev.getAttendanceRecords().stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();

        // Check if volunteer has at least 75% attendance
        if (totalRecords == 0) {
            throw new RuntimeException("Cannot issue certificate: No attendance records found");
        }

        double attendancePercentage = (presentRecords * 100.0) / totalRecords;

        if (attendancePercentage < 75.0) {
            throw new RuntimeException(String.format(
                    "Cannot issue certificate: Volunteer attendance is %.1f%%, minimum required is 75%%",
                    attendancePercentage));
        }

        // Also check ATTENDED status as fallback
        boolean hasAttended = presentRecords > 0 || ev.getStatus() == EventVolunteer.VolunteerStatus.ATTENDED;

        if (!hasAttended) {
            throw new RuntimeException("Cannot issue certificate: Volunteer has not attended the event");
        }

        ev.setCertificateUrl(certificateUrl);
        ev.setCertificateIssuedAt(LocalDateTime.now());
        EventVolunteer saved = eventVolunteerRepository.save(ev);
        emailService.sendCertificationIssuedEmail(saved.getVolunteer(), saved.getEvent());

        notificationService.createNotification(
                saved.getVolunteer(),
                "Certificate Earned",
                "A certificate has been issued for '" + saved.getEvent().getTitle() + "'.",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        return saved;
    }

    @Override
    public EventVolunteer issueCertificateWithFile(Long eventVolunteerId, Long organizerId,
            org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        // Use existing validation logic by calling issueCertificate with a placeholder
        // URL first
        // or just copy the validation here. Let's reuse.

        // Actually, let's just do the storage first, then call issueCertificate.
        String certificateUrl = fileStorageService.storeCertificate(file, eventVolunteerId);
        return issueCertificate(eventVolunteerId, organizerId, certificateUrl);
    }
}

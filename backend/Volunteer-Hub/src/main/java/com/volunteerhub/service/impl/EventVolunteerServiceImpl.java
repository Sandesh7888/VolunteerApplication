package com.volunteerhub.service.impl;

import com.volunteerhub.model.*;
import com.volunteerhub.repository.AttendanceRepository;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.EventVolunteerRepository;
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

        return eventVolunteerRepository.save(eventVolunteer);
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
        return eventVolunteerRepository.save(ev);
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
        return eventVolunteerRepository.save(ev);
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
        eventVolunteerRepository.save(ev);
    }

    @Override
    public List<EventVolunteer> getEventVolunteers(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return eventVolunteerRepository.findByEvent(event);
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
}

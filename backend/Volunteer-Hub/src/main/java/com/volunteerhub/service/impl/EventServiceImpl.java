package com.volunteerhub.service.impl;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.EventVolunteerRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventVolunteerRepository eventVolunteerRepository; // ✅ ADDED

    @Override
    public Event createEvent(Event event, Long userId) {
        System.out.println("CREATE EVENT - userId: " + userId);
        System.out.println("EVENT DATA: " + event);

        User organizer = userRepository.findById(userId)
                .orElseThrow(() -> {
                    System.out.println("USER NOT FOUND: " + userId);
                    return new RuntimeException("Organizer not found with ID: " + userId);
                });

        event.setOrganizer(organizer);
        event.setStatus(Event.EventStatus.PENDING_APPROVAL);
        event.setCurrentVolunteers(0);

        // ✅ HANDLE EVENT DATETIME
        if (event.getStartDate() != null) {
            if (event.getStartTime() != null) {
                event.setDateTime(java.time.LocalDateTime.of(event.getStartDate(), event.getStartTime()));
            } else {
                event.setDateTime(event.getStartDate().atStartOfDay());
            }
        }

        // ✅ VALIDATE REGISTRATION DATES
        validateRegistrationDates(event);

        Event saved = eventRepository.save(event);
        System.out.println("EVENT SAVED: " + saved.getId());
        return saved;
    }

    @Override
    public List<Event> getEventsByOrganizer(Long userId) {
        User organizer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return eventRepository.findByOrganizer(organizer);
    }

    @Override
    public Event updateEvent(Long id, Event updated, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only update your own events");
        }

        System.out.println("🔄 UPDATING EVENT: " + id);
        System.out.println("📥 Incoming StartDate: " + updated.getStartDate());
        System.out.println("📥 Incoming StartTime: " + updated.getStartTime());

        // Update all fields
        event.setTitle(updated.getTitle());
        event.setCategory(updated.getCategory());
        event.setDescription(updated.getDescription());
        event.setStartDate(updated.getStartDate());
        event.setEndDate(updated.getEndDate());
        event.setStartTime(updated.getStartTime());
        event.setEndTime(updated.getEndTime());

        // ✅ RECALCULATE DATETIME
        if (event.getStartDate() != null) {
            System.out.println("✅ RECALCULATING DATETIME...");
            if (event.getStartTime() != null) {
                event.setDateTime(java.time.LocalDateTime.of(event.getStartDate(), event.getStartTime()));
            } else {
                event.setDateTime(event.getStartDate().atStartOfDay());
            }
            System.out.println("✅ NEW DATETIME: " + event.getDateTime());
        } else {
            System.out.println("⚠️ RECALC SKIPPED: StartDate is null");
        }
        event.setLocationName(updated.getLocationName());
        event.setAddress(updated.getAddress());
        event.setCity(updated.getCity());
        event.setArea(updated.getArea());
        event.setMapLink(updated.getMapLink());
        event.setRequiredVolunteers(updated.getRequiredVolunteers());
        event.setSkillsRequired(updated.getSkillsRequired());
        event.setMinAge(updated.getMinAge());
        event.setGenderPreference(updated.getGenderPreference());

        // ✅ NEW FIELD: Registration Dates
        event.setRegistrationOpenDateTime(updated.getRegistrationOpenDateTime());
        event.setRegistrationCloseDateTime(updated.getRegistrationCloseDateTime());

        // ✅ VALIDATE REGISTRATION DATES
        validateRegistrationDates(event);

        return eventRepository.save(event);
    }

    @Override
    public Event publishEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only publish your own events");
        }

        event.setStatus(Event.EventStatus.PUBLISHED);
        return eventRepository.save(event);
    }

    @Override
    public Event completeEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only complete your own events");
        }

        event.setStatus(Event.EventStatus.COMPLETED);
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own events");
        }

        eventRepository.delete(event);
    }

    @Override
    public Event cancelEvent(Long id, Long userId, String reason) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only cancel your own events");
        }

        event.setStatus(Event.EventStatus.CANCELLED);
        event.setCancellationReason(reason);
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getPublishedEvents() {
        return eventRepository.findByStatus(Event.EventStatus.PUBLISHED);
    }

    @Override
    public List<EventVolunteer> getEventVolunteers(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return eventVolunteerRepository.findByEvent(event);
    }

    @Override
    public Event getEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
    }

    private void validateRegistrationDates(Event event) {
        if (event.getRegistrationCloseDateTime() != null && event.getDateTime() != null) {
            if (event.getRegistrationCloseDateTime().isAfter(event.getDateTime())) {
                throw new RuntimeException("Registration close date must be before event start date/time");
            }
        }
        if (event.getRegistrationOpenDateTime() != null && event.getRegistrationCloseDateTime() != null) {
            if (event.getRegistrationOpenDateTime().isAfter(event.getRegistrationCloseDateTime())) {
                throw new RuntimeException("Registration open date must be before registration close date");
            }
        }
    }
}

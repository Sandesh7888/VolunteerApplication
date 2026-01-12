package com.volunteerhub.service.impl;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    // ✅ In-memory volunteer tracking (no DB table needed)
    private final Set<String> volunteerRegistrations = new HashSet<>(); // eventId_volunteerId

    @Override
    public Event createEvent(Event event, Long userId) {
        System.out.println("CREATE EVENT - userId: " + userId);
        User organizer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Organizer not found: " + userId));

        event.setOrganizer(organizer);
        event.setStatus(Event.EventStatus.PUBLISHED);
        event.setCurrentVolunteers(0);

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
    @Transactional
    public Event updateEvent(Long id, Event updated, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own events");
        }

        // Update fields safely
        event.setTitle(updated.getTitle());
        event.setCategory(updated.getCategory());
        event.setDescription(updated.getDescription());
        event.setDateTime(updated.getDateTime());
        event.setLocationName(updated.getLocationName());
        event.setAddress(updated.getAddress());
        event.setCity(updated.getCity());
        event.setArea(updated.getArea());
        event.setMapLink(updated.getMapLink());
        event.setRequiredVolunteers(updated.getRequiredVolunteers());
        event.setSkillsRequired(updated.getSkillsRequired());
        event.setMinAge(updated.getMinAge());
        event.setGenderPreference(updated.getGenderPreference());

        return eventRepository.save(event);
    }

    @Override
    public Event publishEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only publish your own events");
        }

        event.setStatus(Event.EventStatus.PUBLISHED);
        return eventRepository.save(event);
    }

    @Override
    public Event completeEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only complete your own events");
        }

        event.setStatus(Event.EventStatus.COMPLETED);
        return eventRepository.save(event);
    }

    // ✅ FIXED: Volunteer registration - increments counter + tracks
    @Override
    @Transactional
    public void registerVolunteer(Long eventId, Long volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        // Only published events
        if (event.getStatus() != Event.EventStatus.PUBLISHED) {
            throw new RuntimeException("Only published events can be joined");
        }

        // Check capacity
        if (event.getCurrentVolunteers() >= event.getRequiredVolunteers()) {
            throw new RuntimeException("Event is full");
        }

        // Prevent duplicate registration
        String registrationKey = eventId + "_" + volunteerId;
        if (volunteerRegistrations.contains(registrationKey)) {
            throw new RuntimeException("Already registered for this event");
        }

        // Register volunteer
        volunteerRegistrations.add(registrationKey);
        event.setCurrentVolunteers(event.getCurrentVolunteers() + 1);
        eventRepository.save(event);

        System.out.println("Volunteer " + volunteerId + " registered for event " + eventId);
    }

    // ✅ FIXED: Get volunteer's joined events
    @Override
    public List<Event> getEventsByVolunteer(Long volunteerId) {
        return volunteerRegistrations.stream()
                .filter(key -> key.endsWith("_" + volunteerId))
                .map(key -> {
                    String[] parts = key.split("_");
                    Long eventId = Long.parseLong(parts[0]);
                    return eventRepository.findById(eventId).orElse(null);
                })
                .filter(event -> event != null && event.getStatus() == Event.EventStatus.PUBLISHED)
                .collect(Collectors.toList());
    }



    @Override
    public Event updateStatus(Long id, String status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setStatus(Event.EventStatus.valueOf(status));
        return eventRepository.save(event);
    }

    @Override
    public long getTotalVolunteerRegistrations() {
        return volunteerRegistrations.size();  // Your in-memory Set
    }

    // EventServiceImpl.java - ADD THIS METHOD

    @Override
    @Transactional
    public void deleteEventAdmin(Long id) {
        eventRepository.deleteById(id);
    }
    @Override
    public Event findByIdAndOrganizer(Long id, String userIdStr) {
        // ✅ PERFECT - Same logic as updateEvent
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) return null;

        // Check organizer ownership
        Long organizerId;
        try {
            organizerId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            return null; // Invalid userId
        }

        if (event.getOrganizer().getId().equals(organizerId)) {
            return event;
        }
        return null; // Not organizer's event
    }



    public long getTotalEventsCount() {
        return eventRepository.count();
    }

    public long getPendingEventsCount() {
        return eventRepository.countByStatus("PENDING");
    }

    public List<Event> getEventsByStatus(String status) {
        return eventRepository.findByStatus(Event.EventStatus.valueOf(status));
    }

    @Override
    public void deleteEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own events");
        }

        eventRepository.delete(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getPublishedEvents() {
        return eventRepository.findByStatus(Event.EventStatus.PUBLISHED);
    }
}

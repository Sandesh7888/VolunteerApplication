package com.volunteerhub.service.impl;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
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
        event.setStatus(Event.EventStatus.DRAFT);
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
    public Event updateEvent(Long id, Event updated, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only update your own events");
        }

        // Update all fields
        event.setTitle(updated.getTitle());
        event.setCategory(updated.getCategory());
        event.setDescription(updated.getDescription());
        event.setStartDate(updated.getStartDate());
        event.setEndDate(updated.getEndDate());
        event.setStartTime(updated.getStartTime());
        event.setEndTime(updated.getEndTime());
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

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
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

        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
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

        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
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

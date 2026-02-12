package com.volunteerhub.service;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.User;
import java.util.List;

public interface EventService {
    Event createEvent(Event event, Long userId);

    List<Event> getEventsByOrganizer(Long userId);

    List<Event> getPublishedEvents();

    Event updateEvent(Long id, Event event, Long userId);

    Event publishEvent(Long id, Long userId);

    Event completeEvent(Long id, Long userId);

    void deleteEvent(Long id, Long userId);

    Event cancelEvent(Long id, Long userId, String reason);

    List<Event> getAllEvents();

    // ✅ NEW: Add this method
    List<EventVolunteer> getEventVolunteers(Long eventId);

    Event getEventById(Long eventId);

    Event approveEvent(Long id);

    Event rejectEvent(Long id);
}

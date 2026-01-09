package com.volunteerhub.service;

import com.volunteerhub.model.Event;
import java.util.List;

public interface EventService {
    Event createEvent(Event event, Long userId);        // ← Updated with userId
    Event updateEvent(Long id, Event event, Long userId); // ← Updated with userId
    void deleteEvent(Long id, Long userId);             // ← Updated with userId
    List<Event> getAllEvents();
    List<Event> getPublishedEvents();
    List<Event> getEventsByOrganizer(Long userId);      // ← Updated with userId
    Event publishEvent(Long id, Long userId);           // ← Updated with userId
    Event completeEvent(Long id, Long userId);          // ← Updated with userId
}

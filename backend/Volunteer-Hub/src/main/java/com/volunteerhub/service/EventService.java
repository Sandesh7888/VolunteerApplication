package com.volunteerhub.service;

import com.volunteerhub.model.Event;
import java.util.List;
public interface EventService {
    Event createEvent(Event event, Long userId);
    Event updateEvent(Long id, Event event, Long userId);
    void deleteEvent(Long id, Long userId);
    List<Event> getAllEvents();
    List<Event> getPublishedEvents();
    List<Event> getEventsByOrganizer(Long userId);
    Event publishEvent(Long id, Long userId);
    Event completeEvent(Long id, Long userId);

    void registerVolunteer(Long eventId, Long volunteerId);
    List<Event> getEventsByVolunteer(Long volunteerId);

    Event updateStatus(Long id, String status);

    public long getTotalEventsCount();

    public long getPendingEventsCount();

    public List<Event> getEventsByStatus(String status);
    long getTotalVolunteerRegistrations();
    void deleteEventAdmin(Long id);


    Event findByIdAndOrganizer(Long id, String userId);
}

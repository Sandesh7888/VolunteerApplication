package com.volunteerhub.repository;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizer(User organizer);

    List<Event> findByStatus(Event.EventStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e LEFT JOIN FETCH e.organizer")
    List<Event> findAllWithOrganizer();

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e LEFT JOIN FETCH e.organizer WHERE e.status = :status")
    List<Event> findByStatusWithOrganizer(
            @org.springframework.data.repository.query.Param("status") Event.EventStatus status);

    long countByStatus(Event.EventStatus status);
}

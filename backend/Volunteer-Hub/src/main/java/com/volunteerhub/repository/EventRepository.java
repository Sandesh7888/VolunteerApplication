package com.volunteerhub.repository;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizer(User organizer);

    List<Event> findByStatus(Event.EventStatus status);

    long countByStatus(String pending);


}

package com.volunteerhub.repository;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventVolunteerRepository extends JpaRepository<EventVolunteer, Long> {
    List<EventVolunteer> findByEventAndStatus(Event event, EventVolunteer.VolunteerStatus status);

    List<EventVolunteer> findByVolunteerAndStatus(User volunteer, EventVolunteer.VolunteerStatus status);

    List<EventVolunteer> findByEvent(Event event);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT ev FROM EventVolunteer ev JOIN FETCH ev.volunteer LEFT JOIN FETCH ev.feedbacks WHERE ev.event.id = :eventId")
    List<EventVolunteer> findByEventIdWithDetails(
            @org.springframework.data.repository.query.Param("eventId") Long eventId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT ev FROM EventVolunteer ev LEFT JOIN FETCH ev.feedbacks WHERE ev.volunteer = :volunteer")
    List<EventVolunteer> findByVolunteer(
            @org.springframework.data.repository.query.Param("volunteer") User volunteer);

    boolean existsByEventAndVolunteer(Event event, User volunteer);
}
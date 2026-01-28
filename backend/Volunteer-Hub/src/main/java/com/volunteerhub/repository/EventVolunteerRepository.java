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
    List<EventVolunteer> findByVolunteer(User volunteer);
    boolean existsByEventAndVolunteer(Event event, User volunteer);
}
package com.volunteerhub.service;

import com.volunteerhub.model.EventVolunteer;
import java.time.LocalDate;
import java.util.List;

public interface EventVolunteerService {
    EventVolunteer joinEvent(Long eventId, Long volunteerId);

    EventVolunteer approveVolunteer(Long eventVolunteerId, Long organizerId);

    EventVolunteer rejectVolunteer(Long eventVolunteerId, Long organizerId, String reason);

    void removeVolunteer(Long eventVolunteerId, Long organizerId);

    List<EventVolunteer> getEventVolunteers(Long eventId);

    List<EventVolunteer> getVolunteerHistory(Long volunteerId);

    List<EventVolunteer> getOrganizerVolunteerRequests(Long organizerId);

    EventVolunteer markAttendance(Long eventVolunteerId, Long organizerId, LocalDate date, boolean attended);

    void cancelRequest(Long eventVolunteerId, Long volunteerId);
}

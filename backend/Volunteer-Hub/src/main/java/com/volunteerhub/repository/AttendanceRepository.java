package com.volunteerhub.repository;

import com.volunteerhub.model.Attendance;
import com.volunteerhub.model.EventVolunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEventVolunteer(EventVolunteer eventVolunteer);

    Optional<Attendance> findByEventVolunteerAndDate(EventVolunteer eventVolunteer, LocalDate date);
}

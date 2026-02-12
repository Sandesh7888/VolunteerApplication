package com.volunteerhub.controller;

import com.volunteerhub.dto.DashboardStatsDTO;
import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class AdminDashboardController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public DashboardStatsDTO getDashboardStats() {
        return DashboardStatsDTO.builder()
                .totalEvents(eventRepository.count())
                .totalOrganizers(userRepository.countByRole(User.Role.ORGANIZER))
                .totalVolunteers(userRepository.countByRole(User.Role.VOLUNTEER))
                .pendingApprovals(eventRepository.countByStatus(Event.EventStatus.PENDING_APPROVAL))
                .build();
    }
}

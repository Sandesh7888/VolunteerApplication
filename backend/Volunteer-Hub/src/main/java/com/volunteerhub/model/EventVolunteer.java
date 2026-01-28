package com.volunteerhub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_volunteers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventVolunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private User volunteer;
    @Enumerated(EnumType.STRING)
    private VolunteerStatus status = VolunteerStatus.PENDING;
    private LocalDateTime joinedAt;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    @OneToMany(mappedBy = "eventVolunteer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Attendance> attendanceRecords = new ArrayList<>();

    public enum VolunteerStatus {
        PENDING, APPROVED, REJECTED, REMOVED, ATTENDED
    }
}
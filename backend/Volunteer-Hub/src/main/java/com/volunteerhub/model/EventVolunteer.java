package com.volunteerhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class EventVolunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Event event;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User volunteer;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private VolunteerStatus status = VolunteerStatus.PENDING;
    private LocalDateTime joinedAt;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    private String certificateUrl;
    private LocalDateTime certificateIssuedAt;

    @OneToMany(mappedBy = "eventVolunteer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Attendance> attendanceRecords = new ArrayList<>();

    @OneToMany(mappedBy = "eventVolunteer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties("eventVolunteer")
    private List<Feedback> feedbacks = new ArrayList<>();

    public enum VolunteerStatus {
        PENDING, APPROVED, REJECTED, REMOVED, ATTENDED
    }
}
package com.volunteerhub.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @PrePersist
    public void prePersist() {
        if (this.currentVolunteers == null) {
            this.currentVolunteers = 0;
        }
        if (this.status == null) {
            this.status = EventStatus.DRAFT;
        }
    }

    // BASIC INFO - VALIDATED
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    // DATE & TIME - VALIDATED
    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Transient
    private LocalDate startDate;

    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    // LOCATION
    private String locationName;
    private String address;
    private String city;
    private String area;
    private String mapLink;

    // VOLUNTEER REQUIREMENTS - VALIDATED
    @Min(value = 1, message = "At least 1 volunteer required")
    @Max(value = 100, message = "Maximum 100 volunteers allowed")
    private Integer requiredVolunteers;

    private Integer currentVolunteers = 0;
    private String skillsRequired;
    private Integer minAge;
    private String genderPreference;

    // STATUS
    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    // ORGANIZER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    public enum EventStatus {
        DRAFT, PUBLISHED, COMPLETED, CANCELLED
    }
}

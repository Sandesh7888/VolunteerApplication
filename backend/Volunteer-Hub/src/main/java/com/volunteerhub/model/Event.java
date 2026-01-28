package com.volunteerhub.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

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
            this.status = EventStatus.PENDING_APPROVAL;
        }
        // Set default registration dates if not provided
        if (this.registrationOpenDateTime == null) {
            this.registrationOpenDateTime = LocalDateTime.now();
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

    // REGISTRATION DATES
    private LocalDateTime registrationOpenDateTime;
    private LocalDateTime registrationCloseDateTime;

    @Transient
    private LocalDate registrationOpenDate;
    @Transient
    private LocalTime registrationOpenTime;
    @Transient
    private LocalDate registrationCloseDate;
    @Transient
    private LocalTime registrationCloseTime;

    // VOLUNTEER REQUIREMENTS - VALIDATED
    @Min(value = 1, message = "At least 1 volunteer required")
    @Max(value = 100, message = "Maximum 100 volunteers allowed")
    private Integer requiredVolunteers;

    @Builder.Default
    private Integer currentVolunteers = 0;
    private String skillsRequired;
    private Integer minAge;
    private String genderPreference;

    // STATUS
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.PENDING_APPROVAL;

    // ORGANIZER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<EventVolunteer> registrations = new ArrayList<>();

    public enum EventStatus {
        DRAFT,
        PENDING_APPROVAL,
        PUBLISHED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }

    // NEW FIELD
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @PostLoad
    public void populateTransientFields() {
        if (dateTime != null) {
            this.startDate = dateTime.toLocalDate();
            this.startTime = dateTime.toLocalTime();
        }
        if (registrationOpenDateTime != null) {
            this.registrationOpenDate = registrationOpenDateTime.toLocalDate();
            this.registrationOpenTime = registrationOpenDateTime.toLocalTime();
        }
        if (registrationCloseDateTime != null) {
            this.registrationCloseDate = registrationCloseDateTime.toLocalDate();
            this.registrationCloseTime = registrationCloseDateTime.toLocalTime();
        }
    }

}

package com.volunteerhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Builder.Default
    private Integer points = 0;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Long number;

    @Column(unique = true)
    private String vmsId;

    @Builder.Default
    private Boolean verified = false;

    private String verificationOtp;

    private java.time.LocalDateTime otpExpiry;

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Event> events = new ArrayList<>();

    @JsonIgnore
    public List<Event> getEvents() {
        return events;
    }

    @OneToMany(mappedBy = "volunteer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<EventVolunteer> registrations = new ArrayList<>();

    @JsonIgnore
    public List<EventVolunteer> getRegistrations() {
        return registrations;
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<SupportTicket> supportTickets = new ArrayList<>();

    @Builder.Default
    private Boolean documentsVerified = false;

    @JsonIgnore
    public List<UserDocument> getDocuments() {
        return documents;
    }

    @JsonIgnore
    public List<Notification> getNotifications() {
        return notifications;
    }

    @JsonIgnore
    public List<SupportTicket> getSupportTickets() {
        return supportTickets;
    }

    public enum Role {
        ADMIN, ORGANIZER, VOLUNTEER
    }
}

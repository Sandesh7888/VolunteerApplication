package com.volunteerhub.service.impl;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.EventVolunteer;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.EventVolunteerRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventVolunteerRepository eventVolunteerRepository; // ✅ ADDED
    private final com.volunteerhub.service.EmailService emailService;
    private final com.volunteerhub.service.NotificationService notificationService;

    @Override
    public Event createEvent(Event event, Long userId) {
        System.out.println("CREATE EVENT - userId: " + userId);
        System.out.println("EVENT DATA: " + event);

        User organizer = userRepository.findById(userId)
                .orElseThrow(() -> {
                    System.out.println("USER NOT FOUND: " + userId);
                    return new RuntimeException("Organizer not found with ID: " + userId);
                });

        event.setOrganizer(organizer);
        event.setStatus(Event.EventStatus.PENDING_APPROVAL);
        event.setCurrentVolunteers(0);

        // ✅ HANDLE EVENT DATETIME
        if (event.getStartDate() != null) {
            if (event.getStartTime() != null) {
                event.setDateTime(java.time.LocalDateTime.of(event.getStartDate(), event.getStartTime()));
            } else {
                event.setDateTime(event.getStartDate().atStartOfDay());
            }
        }

        // ✅ VALIDATE REGISTRATION DATES
        validateRegistrationDates(event);

        Event saved = eventRepository.save(event);
        System.out.println("EVENT SAVED: " + saved.getId());
        // emailService.sendEventCreatedEmail(organizer, saved);
        notificationService.createNotification(
                organizer,
                "Event Created",
                "Your event '" + saved.getTitle() + "' has been successfully created.",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        notificationService.notifyAdmins(
                "New Event Draft",
                "A new event '" + saved.getTitle() + "' has been created by " + organizer.getName()
                        + " and is pending approval.",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        return saved;
    }

    @Override
    public List<Event> getEventsByOrganizer(Long userId) {
        User organizer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return eventRepository.findByOrganizer(organizer);
    }

    @Override
    public Event updateEvent(Long id, Event updated, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only update your own events");
        }

        // Check for critical changes before updating
        boolean criticalChange = false;
        if (!java.util.Objects.equals(event.getStartDate(), updated.getStartDate()) ||
                !java.util.Objects.equals(event.getStartTime(), updated.getStartTime()) ||
                !java.util.Objects.equals(event.getLocationName(), updated.getLocationName()) ||
                !java.util.Objects.equals(event.getAddress(), updated.getAddress()) ||
                !java.util.Objects.equals(event.getCity(), updated.getCity())) {
            criticalChange = true;
        }

        // Update all fields
        event.setTitle(updated.getTitle());
        event.setCategory(updated.getCategory());
        event.setDescription(updated.getDescription());
        event.setStartDate(updated.getStartDate());
        event.setEndDate(updated.getEndDate());
        event.setStartTime(updated.getStartTime());
        event.setEndTime(updated.getEndTime());

        // ✅ RECALCULATE DATETIME
        if (event.getStartDate() != null) {
            System.out.println("✅ RECALCULATING DATETIME...");
            if (event.getStartTime() != null) {
                event.setDateTime(java.time.LocalDateTime.of(event.getStartDate(), event.getStartTime()));
            } else {
                event.setDateTime(event.getStartDate().atStartOfDay());
            }
            System.out.println("✅ NEW DATETIME: " + event.getDateTime());
        } else {
            System.out.println("⚠️ RECALC SKIPPED: StartDate is null");
        }
        event.setLocationName(updated.getLocationName());
        event.setAddress(updated.getAddress());
        event.setCity(updated.getCity());
        event.setArea(updated.getArea());
        event.setMapLink(updated.getMapLink());
        event.setRequiredVolunteers(updated.getRequiredVolunteers());
        event.setSkillsRequired(updated.getSkillsRequired());
        event.setMinAge(updated.getMinAge());
        event.setGenderPreference(updated.getGenderPreference());

        // ✅ NEW FIELD: Registration Dates
        event.setRegistrationOpenDateTime(updated.getRegistrationOpenDateTime());
        event.setRegistrationCloseDateTime(updated.getRegistrationCloseDateTime());

        // ✅ VALIDATE REGISTRATION DATES
        validateRegistrationDates(event);

        Event saved = eventRepository.save(event);

        if (criticalChange) {
            String changeDetails = String.format("New Schedule: %s at %s. Location: %s",
                    saved.getStartDate(), saved.getStartTime(), saved.getLocationName());
            List<EventVolunteer> volunteers = eventVolunteerRepository.findByEvent(saved);
            for (EventVolunteer ev : volunteers) {
                if (ev.getStatus() == EventVolunteer.VolunteerStatus.APPROVED) {
                    emailService.sendEventUpdatedEmail(ev.getVolunteer(), saved, changeDetails);
                    notificationService.createNotification(
                            ev.getVolunteer(),
                            "Event Updated",
                            "Details for '" + saved.getTitle() + "' have been updated.",
                            com.volunteerhub.model.Notification.NotificationType.INFO);
                }
            }
        }

        return saved;
    }

    @Override
    public Event publishEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only publish your own events");
        }

        event.setStatus(Event.EventStatus.PUBLISHED);
        Event saved = eventRepository.save(event);

        notificationService.createNotification(
                saved.getOrganizer(),
                "Event Published",
                "Your event '" + saved.getTitle() + "' is now live!",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        return saved;
    }

    @Override
    public Event completeEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only complete your own events");
        }

        event.setStatus(Event.EventStatus.COMPLETED);
        Event saved = eventRepository.save(event);

        // Send notification to organizer
        // emailService.sendEventEndEmail(currentUser, saved, true);
        notificationService.createNotification(
                currentUser,
                "Event Completed",
                "Your event '" + saved.getTitle() + "' has been marked as completed.",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        notificationService.notifyAdmins(
                "Event Completed",
                "The event '" + saved.getTitle() + "' organized by " + currentUser.getName() + " has been completed.",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        // Send notification to all approved/attended volunteers
        List<EventVolunteer> volunteers = eventVolunteerRepository.findByEvent(saved);
        for (EventVolunteer ev : volunteers) {
            if (ev.getStatus() == EventVolunteer.VolunteerStatus.APPROVED
                    || ev.getStatus() == EventVolunteer.VolunteerStatus.ATTENDED) {
                // emailService.sendEventEndEmail(ev.getVolunteer(), saved, false);
                notificationService.createNotification(
                        ev.getVolunteer(),
                        "Event Completed",
                        "The event '" + saved.getTitle() + "' has ended. Thank you for your contribution!",
                        com.volunteerhub.model.Notification.NotificationType.INFO);
            }
        }

        return saved;
    }

    @Override
    public void deleteEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own events");
        }

        eventRepository.delete(event);
    }

    @Override
    public Event cancelEvent(Long id, Long userId, String reason) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only cancel your own events");
        }

        event.setStatus(Event.EventStatus.CANCELLED);
        event.setCancellationReason(reason);
        Event saved = eventRepository.save(event);

        // Notify all approved volunteers
        List<EventVolunteer> volunteers = eventVolunteerRepository.findByEvent(saved);
        for (EventVolunteer ev : volunteers) {
            if (ev.getStatus() == EventVolunteer.VolunteerStatus.APPROVED
                    || ev.getStatus() == EventVolunteer.VolunteerStatus.PENDING) {
                emailService.sendEventCancelledEmail(ev.getVolunteer(), saved, reason);
                notificationService.createNotification(
                        ev.getVolunteer(),
                        "Event Cancelled",
                        "The event '" + saved.getTitle() + "' has been cancelled.",
                        com.volunteerhub.model.Notification.NotificationType.WARNING);
            }
        }

        notificationService.notifyAdmins(
                "Event Cancelled",
                "The event '" + saved.getTitle() + "' has been cancelled by " + currentUser.getName() + ".",
                com.volunteerhub.model.Notification.NotificationType.WARNING);

        return saved;
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getPublishedEvents() {
        return eventRepository.findByStatus(Event.EventStatus.PUBLISHED);
    }

    @Override
    public List<EventVolunteer> getEventVolunteers(Long eventId) {
        return eventVolunteerRepository.findByEventIdWithDetails(eventId);
    }

    @Override
    public Event getEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
    }

    @Override
    public Event approveEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(Event.EventStatus.PUBLISHED);
        Event saved = eventRepository.save(event);

        notificationService.createNotification(
                saved.getOrganizer(),
                "Event Approved",
                "Your event '" + saved.getTitle() + "' has been approved and is now live!",
                com.volunteerhub.model.Notification.NotificationType.SUCCESS);

        return saved;
    }

    @Override
    public Event rejectEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(Event.EventStatus.REJECTED);
        Event saved = eventRepository.save(event);

        notificationService.createNotification(
                saved.getOrganizer(),
                "Event Rejected",
                "Your event '" + saved.getTitle() + "' was not approved. Please review the details.",
                com.volunteerhub.model.Notification.NotificationType.ERROR);

        return saved;
    }

    private void validateRegistrationDates(Event event) {
        if (event.getRegistrationCloseDateTime() != null && event.getDateTime() != null) {
            if (event.getRegistrationCloseDateTime().isAfter(event.getDateTime())) {
                throw new RuntimeException("Registration close date must be before event start date/time");
            }
        }
        if (event.getRegistrationOpenDateTime() != null && event.getRegistrationCloseDateTime() != null) {
            if (event.getRegistrationOpenDateTime().isAfter(event.getRegistrationCloseDateTime())) {
                throw new RuntimeException("Registration open date must be before registration close date");
            }
        }
    }
}

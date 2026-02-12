package com.volunteerhub.controller;

import com.volunteerhub.model.Event;
import com.volunteerhub.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class AdminEventController {
    private final EventRepository eventRepository;
    private final com.volunteerhub.service.EventService eventService;

    // 🔥 PENDING EVENTS
    @GetMapping("/pending")
    public List<Event> getPendingEvents() {
        return eventRepository.findByStatusWithOrganizer(Event.EventStatus.PENDING_APPROVAL);
    }

    // 📋 ALL EVENTS (For Admin View)
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAllWithOrganizer();
    }

    // ✅ APPROVE EVENT
    @PatchMapping("/{id}/approve")
    public Event approveEvent(@PathVariable Long id) {
        return eventService.approveEvent(id);
    }

    // ❌ REJECT EVENT
    @PatchMapping("/{id}/reject")
    public Event rejectEvent(@PathVariable Long id) {
        return eventService.rejectEvent(id);
    }

    // 🗑️ DELETE EVENT
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        eventRepository.delete(event);
    }
}
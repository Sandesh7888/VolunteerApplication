package com.volunteerhub.controller;

import com.volunteerhub.model.SupportTicket;
import com.volunteerhub.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(
            @RequestParam Long userId,
            @RequestParam String subject,
            @RequestParam String description,
            @RequestParam SupportTicket.TicketCategory category,
            @RequestParam(required = false, defaultValue = "MEDIUM") SupportTicket.TicketPriority priority) {

        SupportTicket ticket = supportTicketService.createTicket(userId, subject, description, category, priority);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getUserTickets(@PathVariable Long userId) {
        List<SupportTicket> tickets = supportTicketService.getUserTickets(userId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets(
            @RequestParam(required = false) SupportTicket.TicketStatus status) {

        List<SupportTicket> tickets;
        if (status != null) {
            tickets = supportTicketService.getTicketsByStatus(status);
        } else {
            tickets = supportTicketService.getAllTickets();
        }
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable Long id) {
        SupportTicket ticket = supportTicketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam SupportTicket.TicketStatus status,
            @RequestParam(required = false) String adminNotes) {

        SupportTicket ticket = supportTicketService.updateTicketStatus(id, adminId, status, adminNotes);
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @RequestParam Long adminId) {

        supportTicketService.deleteTicket(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getTicketStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("new", supportTicketService.getTicketCountByStatus(SupportTicket.TicketStatus.NEW));
        stats.put("inProgress", supportTicketService.getTicketCountByStatus(SupportTicket.TicketStatus.IN_PROGRESS));
        long resolvedCount = supportTicketService.getTicketCountByStatus(SupportTicket.TicketStatus.RESOLVED) +
                supportTicketService.getTicketCountByStatus(SupportTicket.TicketStatus.FIXED);
        stats.put("resolved", resolvedCount);
        return ResponseEntity.ok(stats);
    }
}

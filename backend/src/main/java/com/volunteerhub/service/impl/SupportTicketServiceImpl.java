package com.volunteerhub.service.impl;

import com.volunteerhub.model.SupportTicket;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.SupportTicketRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.EmailService;
import com.volunteerhub.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final com.volunteerhub.service.NotificationService notificationService;

    @Override
    @Transactional
    public SupportTicket createTicket(Long userId, String subject, String description,
            SupportTicket.TicketCategory category,
            SupportTicket.TicketPriority priority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(subject)
                .description(description)
                .category(category)
                .priority(priority)
                .status(SupportTicket.TicketStatus.NEW)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);

        notificationService.notifyAdmins(
                "New Support Ticket",
                "A new support ticket '" + saved.getSubject() + "' has been submitted by " + user.getName() + ".",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        return saved;
    }

    @Override
    public List<SupportTicket> getUserTickets(Long userId) {
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<SupportTicket> getTicketsByStatus(SupportTicket.TicketStatus status) {
        return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    public SupportTicket getTicketById(Long ticketId) {
        return supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    @Override
    @Transactional
    public SupportTicket updateTicketStatus(Long ticketId, Long adminId,
            SupportTicket.TicketStatus status,
            String adminNotes) {
        // Verify admin role
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Only admins can update ticket status");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            String existingNotes = ticket.getAdminNotes();
            if (existingNotes != null && !existingNotes.isEmpty()) {
                ticket.setAdminNotes(existingNotes + "\n\n" + adminNotes);
            } else {
                ticket.setAdminNotes(adminNotes);
            }
        }

        SupportTicket saved = supportTicketRepository.save(ticket);

        // Notify user if resolved
        if (status == SupportTicket.TicketStatus.RESOLVED || status == SupportTicket.TicketStatus.FIXED) {
            emailService.sendSupportTicketResolvedEmail(saved.getUser(), saved);

            notificationService.createNotification(
                    saved.getUser(),
                    "Ticket Resolved",
                    "Your support ticket '" + saved.getSubject() + "' has been resolved.",
                    com.volunteerhub.model.Notification.NotificationType.SUCCESS);
        } else {
            // General update notification (for notes or in-progress status)
            notificationService.createNotification(
                    saved.getUser(),
                    "Ticket Dashboard Updated",
                    "There is an update on your ticket '" + saved.getSubject() + "'. Please check your dashboard.",
                    com.volunteerhub.model.Notification.NotificationType.INFO);
        }

        return saved;
    }

    @Override
    @Transactional
    public void deleteTicket(Long ticketId, Long adminId) {
        // Verify admin role
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Only admins can delete tickets");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        supportTicketRepository.delete(ticket);
    }

    @Override
    public long getTicketCountByStatus(SupportTicket.TicketStatus status) {
        return supportTicketRepository.countByStatus(status);
    }
}

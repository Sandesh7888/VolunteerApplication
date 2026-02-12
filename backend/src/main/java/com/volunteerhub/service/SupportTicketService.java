package com.volunteerhub.service;

import com.volunteerhub.model.SupportTicket;

import java.util.List;

public interface SupportTicketService {

    SupportTicket createTicket(Long userId, String subject, String description,
            SupportTicket.TicketCategory category,
            SupportTicket.TicketPriority priority);

    List<SupportTicket> getUserTickets(Long userId);

    List<SupportTicket> getAllTickets();

    List<SupportTicket> getTicketsByStatus(SupportTicket.TicketStatus status);

    SupportTicket getTicketById(Long ticketId);

    SupportTicket updateTicketStatus(Long ticketId, Long adminId,
            SupportTicket.TicketStatus status,
            String adminNotes);

    void deleteTicket(Long ticketId, Long adminId);

    long getTicketCountByStatus(SupportTicket.TicketStatus status);
}

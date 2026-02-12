package com.volunteerhub.repository;

import com.volunteerhub.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SupportTicket> findByStatusOrderByCreatedAtDesc(SupportTicket.TicketStatus status);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    List<SupportTicket> findByCategoryOrderByCreatedAtDesc(SupportTicket.TicketCategory category);

    long countByStatus(SupportTicket.TicketStatus status);
}

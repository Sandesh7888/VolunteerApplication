package com.volunteerhub.repository;

import com.volunteerhub.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    void deleteByUserId(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);
}

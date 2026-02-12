package com.volunteerhub.service.impl;

import com.volunteerhub.model.Notification;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.NotificationRepository;
import com.volunteerhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.volunteerhub.repository.UserRepository userRepository;

    @Override
    @Transactional
    public void notifyAdmins(String title, String message, Notification.NotificationType type) {
        notifyRole(com.volunteerhub.model.User.Role.ADMIN, title, message, type);
    }

    @Override
    @Transactional
    public void notifyRole(com.volunteerhub.model.User.Role role, String title, String message,
            Notification.NotificationType type) {
        List<com.volunteerhub.model.User> users = userRepository.findByRole(role);
        for (com.volunteerhub.model.User user : users) {
            createNotification(user, title, message, type);
        }
    }

    @Override
    @Transactional
    public Notification createNotification(User user, String title, String message,
            Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllUserNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}

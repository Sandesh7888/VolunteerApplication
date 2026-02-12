package com.volunteerhub.service;

import com.volunteerhub.model.Notification;
import com.volunteerhub.model.User;

import java.util.List;

public interface NotificationService {

    Notification createNotification(User user, String title, String message, Notification.NotificationType type);

    List<Notification> getUserNotifications(Long userId);

    void markAsRead(Long notificationId);

    void deleteNotification(Long notificationId, Long userId);

    void deleteAllUserNotifications(Long userId);

    long getUnreadCount(Long userId);

    void notifyAdmins(String title, String message, Notification.NotificationType type);

    void notifyRole(User.Role role, String title, String message, Notification.NotificationType type);
}

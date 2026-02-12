package com.volunteerhub.service;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;

public interface EmailService {
    void sendVerificationEmail(User user, String otp);

    void sendForgotPasswordEmail(User user, String otp);

    void sendAccountDeletedEmail(String email, String name);

    void sendEventJoinAcceptedEmail(User volunteer, Event event);

    void sendEventCreatedEmail(User organizer, Event event);

    void sendEventEndEmail(User user, Event event, boolean isOrganizer);

    void sendWelcomeEmail(User user);

    void sendDocumentVerifiedEmail(User user);

    void sendCertificationIssuedEmail(User volunteer, Event event);

    void sendEventJoinRequestEmail(User volunteer, Event event);

    void sendEventJoinRejectedEmail(User volunteer, Event event, String reason);

    void sendEventCancelledEmail(User volunteer, Event event, String reason);

    void sendEventUpdatedEmail(User volunteer, Event event, String changeDetails);

    void sendDocumentRejectedEmail(User user, String reason);

    void sendSupportTicketResolvedEmail(User user, com.volunteerhub.model.SupportTicket ticket);
}

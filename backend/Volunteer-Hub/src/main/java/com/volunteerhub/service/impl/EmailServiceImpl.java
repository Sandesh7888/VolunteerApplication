package com.volunteerhub.service.impl;

import com.volunteerhub.model.Event;
import com.volunteerhub.model.User;
import com.volunteerhub.model.SupportTicket;
import com.volunteerhub.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

        private final JavaMailSender mailSender;

        private void sendEmail(String to, String subject, String content) {
                try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                        helper.setTo(to);
                        helper.setSubject(subject);
                        helper.setText(content, true);
                        mailSender.send(message);
                } catch (Exception e) {
                        // Log error but don't crash - allows dev mode without SMTP
                        System.err.println("⚠️ EMAIL SEND FAILED (Ignored for Dev): " + e.getMessage());
                        System.out.println("⚠️ IF YOU ARE IN DEV MODE, CHECK CONSOLE FOR OTP/LINKS ⚠️");
                }
        }

        private String wrapWithFormalTemplate(String title, String content, String vmsId) {
                return "<!DOCTYPE html>" +
                                "<html>" +
                                "<head>" +
                                "<style>" +
                                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }"
                                +
                                "  .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }"
                                +
                                "  .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white; }"
                                +
                                "  .header h1 { margin: 0; font-size: 24px; letter-spacing: -0.025em; font-weight: 800; }"
                                +
                                "  .content { padding: 40px; background: #ffffff; }" +
                                "  .content h2 { color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; }" +
                                "  .vms-tag { display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 6px; font-family: monospace; font-weight: bold; color: #475569; margin-top: 10px; }"
                                +
                                "  .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }"
                                +
                                "  .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }"
                                +
                                "</style>" +
                                "</head>" +
                                "<body>" +
                                "  <div class='container'>" +
                                "    <div class='header'>" +
                                "      <h1>VOLUNTEER HUB</h1>" +
                                "      <p style='margin: 5px 0 0; font-size: 12px; opacity: 0.8; letter-spacing: 0.1em; text-transform: uppercase;'>Empowering Social Impact</p>"
                                +
                                "    </div>" +
                                "    <div class='content'>" +
                                "      <h2>" + title + "</h2>" +
                                "      " + content +
                                "      "
                                + (vmsId != null
                                                ? "<p style='margin-top: 30px; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;'>Official System Identification</p><div class='vms-tag'>"
                                                                + vmsId + "</div>"
                                                : "")
                                +
                                "    </div>" +
                                "    <div class='footer'>" +
                                "      <p>&copy; 2026 Volunteer Hub Ecosystem. All rights reserved.</p>" +
                                "      <p>Helping hands for a better tomorrow.</p>" +
                                "    </div>" +
                                "  </div>" +
                                "</body>" +
                                "</html>";
        }

        @Override
        public void sendVerificationEmail(User user, String otp) {
                String subject = "Verify Your Identity - Volunteer Hub";
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>Thank you for initiating your registration with Volunteer Hub. To ensure the security of our community, please use the following One-Time Password (OTP) to verify your email address:</p>"
                                +
                                "<div style='background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;'>"
                                +
                                "  <span style='font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #4f46e5;'>"
                                + otp
                                + "</span>" +
                                "</div>" +
                                "<p>Please note that this code is confidential and will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>";

                sendEmail(user.getEmail(), subject, wrapWithFormalTemplate("Identity Verification", content, null));
        }

        @Override
        public void sendForgotPasswordEmail(User user, String otp) {
                String subject = "Password Recovery Assistance - Volunteer Hub";
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>We received a request to reset the password associated with your Volunteer Hub account.</p>"
                                +
                                "<p>To proceed with setting a new password, please enter the following verification code:</p>"
                                +
                                "<div style='background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;'>"
                                +
                                "  <span style='font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #4f46e5;'>"
                                + otp
                                + "</span>" +
                                "</div>" +
                                "<p>If you did not authorize this request, please contact our security team immediately to protect your account.</p>";

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Security Alert: Password Reset", content, null));
        }

        @Override
        public void sendAccountDeletedEmail(String email, String name) {
                String subject = "Confirmation of Account Deletion - Volunteer Hub";
                String content = "<p>Dear <strong>" + name + "</strong>,</p>" +
                                "<p>This email serves as official confirmation that your Volunteer Hub account has been successfully deleted from our records.</p>"
                                +
                                "<p>We appreciate your past contributions to the community. If this deletion was unintentional, please contact our support team within 48 hours for recovery options.</p>";

                sendEmail(email, subject, wrapWithFormalTemplate("Account Deletion Finalized", content, null));
        }

        @Override
        public void sendEventJoinAcceptedEmail(User volunteer, Event event) {
                String subject = "Deployment Confirmed: " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>We are pleased to inform you that your application to participate in <strong>"
                                + event.getTitle()
                                + "</strong> has been officially <strong>Approved</strong>.</p>" +
                                "<div style='margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #22c55e;'>"
                                +
                                "  <p style='margin:0;'><strong>Mission Date:</strong> " + event.getStartDate() + "</p>"
                                +
                                "  <p style='margin:5px 0 0;'><strong>Coordination Center:</strong> "
                                + event.getLocationName() + "</p>"
                                +
                                "</div>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Mission Acceptance Notice", content, volunteer.getVmsId()));
        }

        @Override
        public void sendEventCreatedEmail(User organizer, Event event) {
                String subject = "Event Authorization Complete - " + event.getTitle();
                String content = "<p>Dear <strong>" + organizer.getName() + "</strong>,</p>" +
                                "<p>Your initiative <strong>" + event.getTitle()
                                + "</strong> has been successfully registered on the platform.</p>" +
                                "<p>You can now manage volunteer applications and coordinate mission logistics from your Organizer Dashboard.</p>";

                sendEmail(organizer.getEmail(), subject,
                                wrapWithFormalTemplate("Initiative Successfully Launched", content,
                                                organizer.getVmsId()));
        }

        @Override
        public void sendEventEndEmail(User user, Event event, boolean isOrganizer) {
                String subject = "Mission Conclusion Report - " + event.getTitle();
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>The initiative <strong>" + event.getTitle()
                                + "</strong> has reached its scheduled conclusion.</p>"
                                +
                                (isOrganizer
                                                ? "<p>Please ensure all attendance records and impact points are finalized for your volunteers.</p>"
                                                : "<p>We thank you for your dedicated service and contribution to this mission. Your impact points have been updated.</p>");

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Mission Concluded", content, user.getVmsId()));
        }

        @Override
        public void sendWelcomeEmail(User user) {
                String subject = "Official Onboarding - Volunteer Hub";
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>It is my distinct pleasure to welcome you to the Volunteer Hub ecosystem. Your account is now fully verified and operational.</p>"
                                +
                                "<p>As a valued member, you are encouraged to engage with upcoming missions that align with your expertise and commitment level.</p>"
                                +
                                "<div style='margin-top: 20px; font-weight: bold;'>Account Information:</div>" +
                                "<ul>" +
                                "  <li>Official Role: " + user.getRole() + "</li>" +
                                "  <li>Credential Status: Active</li>" +
                                "</ul>";

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Welcome to the Community", content, user.getVmsId()));
        }

        @Override
        public void sendDocumentVerifiedEmail(User user) {
                String subject = "Credential Verification Status: Success";
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>Our compliance team has completed the review of your secondary identification documents. Your profile status has been upgraded to <strong>'Verified'</strong>.</p>"
                                +
                                "<p>You now hold the full privileges associated with your role on the platform.</p>";

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Identity Verification Complete", content, user.getVmsId()));
        }

        @Override
        public void sendCertificationIssuedEmail(User volunteer, Event event) {
                String subject = "Formal Recognition: " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>In recognition of your outstanding contribution to <strong>" + event.getTitle()
                                + "</strong>, a formal Certificate of Achievement has been issued to you.</p>" +
                                "<p>This credential can be accessed and downloaded in PDF format via your personal Milestones dashboard.</p>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Certificate of Achievement", content, volunteer.getVmsId()));
        }

        @Override
        public void sendEventJoinRequestEmail(User volunteer, Event event) {
                String subject = "Application Received: " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>Your application to participate in <strong>" + event.getTitle()
                                + "</strong> has been successfully received.</p>" +
                                "<p>The event organizer, <strong>" + event.getOrganizer().getName()
                                + "</strong>, will review your request shortly. You will receive an email notification once a decision has been made.</p>"
                                +
                                "<div style='margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #4f46e5;'>"
                                +
                                "  <p style='margin:0;'><strong>Mission:</strong> " + event.getTitle() + "</p>"
                                +
                                "  <p style='margin:5px 0 0;'><strong>Status:</strong> Pending Review</p>"
                                +
                                "</div>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Application Submission Confirmed", content,
                                                volunteer.getVmsId()));
        }

        @Override
        public void sendEventJoinRejectedEmail(User volunteer, Event event, String reason) {
                String subject = "Update Regarding Your Application: " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>Thank you for your interest in volunteering for <strong>" + event.getTitle()
                                + "</strong>.</p>" +
                                "<p>After careful review of your application, we regret to inform you that we are <strong>unable to proceed</strong> with your deployment at this time.</p>"
                                +
                                "<div style='margin: 20px 0; padding: 15px; background: #fff1f2; border-radius: 8px; border-left: 4px solid #f43f5e;'>"
                                +
                                "  <p style='margin:0;'><strong>Decision Note:</strong> " + reason + "</p>" +
                                "</div>" +
                                "<p>We appreciate your willingness to help and encourage you to apply for other upcoming opportunities that match your profile.</p>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Application Status Update", content, volunteer.getVmsId()));
        }

        @Override
        public void sendEventCancelledEmail(User volunteer, Event event, String reason) {
                String subject = "IMPORTANT: Mission Cancellation - " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>This is an important notification regarding the initiative <strong>"
                                + event.getTitle()
                                + "</strong>.</p>" +
                                "<p>Due to unforeseen circumstances, this mission has been <strong>Cancelled</strong> by the organizer.</p>"
                                +
                                "<div style='margin: 20px 0; padding: 15px; background: #fff1f2; border-radius: 8px; border-left: 4px solid #f43f5e;'>"
                                +
                                "  <p style='margin:0;'><strong>Cancellation Reason:</strong> " + reason + "</p>" +
                                "</div>" +
                                "<p>We apologize for any inconvenience this may cause and thank you for your commitment to social impact.</p>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Mission Cancellation Notice", content, volunteer.getVmsId()));
        }

        @Override
        public void sendEventUpdatedEmail(User volunteer, Event event, String changeDetails) {
                String subject = "Mission Update: Changes to " + event.getTitle();
                String content = "<p>Dear <strong>" + volunteer.getName() + "</strong>,</p>" +
                                "<p>We are writing to inform you of recent updates to <strong>" + event.getTitle()
                                + "</strong>.</p>" +
                                "<div style='margin: 20px 0; padding: 15px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;'>"
                                +
                                "  <p style='margin:0;'><strong>Updated Logistics:</strong></p>" +
                                "  <p style='margin:5px 0 0;'>" + changeDetails + "</p>" +
                                "</div>" +
                                "<p>Please review these changes carefully to ensure they align with your availability. You can view the full details on your dashboard.</p>";

                sendEmail(volunteer.getEmail(), subject,
                                wrapWithFormalTemplate("Logistics Update Notice", content, volunteer.getVmsId()));
        }

        @Override
        public void sendDocumentRejectedEmail(User user, String reason) {
                String subject = "Action Required: Credential Verification Issues";
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>Our compliance team has reviewed the documents you provided for identity verification.</p>"
                                +
                                "<p>Regrettably, we were <strong>unable to verify</strong> one or more of your documents.</p>"
                                +
                                "<div style='margin: 20px 0; padding: 15px; background: #fff1f2; border-radius: 8px; border-left: 4px solid #f43f5e;'>"
                                +
                                "  <p style='margin:0;'><strong>Verification Feedback:</strong> " + reason + "</p>" +
                                "</div>" +
                                "<p>Please visit your document management portal to re-upload the necessary credentials to ensure continued access to the platform.</p>";

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Document Verification Update", content, user.getVmsId()));
        }

        @Override
        public void sendSupportTicketResolvedEmail(User user, SupportTicket ticket) {
                String subject = "Support Ticket Resolved: " + ticket.getSubject();
                String content = "<p>Dear <strong>" + user.getName() + "</strong>,</p>" +
                                "<p>Your support ticket regarding <strong>'" + ticket.getSubject()
                                + "'</strong> has been marked as <strong>Resolved</strong>.</p>" +
                                "<div style='margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;'>"
                                +
                                "  <p style='margin:0;'><strong>Resolution Notes:</strong></p>" +
                                "  <p style='margin:5px 0 0;'>" + ticket.getAdminNotes() + "</p>" +
                                "</div>" +
                                "<p>If you have any further questions, please do not hesitate to open a new ticket or reply to this message.</p>";

                sendEmail(user.getEmail(), subject,
                                wrapWithFormalTemplate("Support Assistance Complete", content, user.getVmsId()));
        }
}

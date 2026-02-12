package com.volunteerhub.service.impl;

import com.volunteerhub.model.User;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.volunteerhub.repository.EventRepository eventRepository;
    private final com.volunteerhub.repository.SupportTicketRepository supportTicketRepository;
    private final com.volunteerhub.repository.EventVolunteerRepository eventVolunteerRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.volunteerhub.service.EmailService emailService;
    private final com.volunteerhub.service.NotificationService notificationService;

    @Override
    public User register(User user) {
        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.getVerified())) {
                throw new RuntimeException("Email already exists");
            }
            // Overwrite existing unverified user
            user.setId(existingUser.getId());
            user.setVmsId(existingUser.getVmsId()); // Maintain original ID
            // Continue with registration (will update password, name, etc.)
        } else {
            // Generate unique VMS ID for NEW users only
            String prefix = user.getRole() == User.Role.VOLUNTEER ? "VOL-" : "ORG-";
            user.setVmsId(prefix + System.currentTimeMillis() % 1000000);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Generate OTP and set expiry
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        System.out.println("🔐 REGISTRATION OTP: " + otp); // Log OTP for debugging/testing
        user.setVerificationOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(savedUser, otp);

        notificationService.createNotification(
                savedUser,
                "Verification Email Sent",
                "An OTP verification email has been sent to your registered address.",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        return savedUser;
    }

    @Override
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        // Verification check removed to allow unverified users to login
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);

        if (updatedUser.getName() != null)
            user.setName(updatedUser.getName());
        if (updatedUser.getNumber() != null)
            user.setNumber(updatedUser.getNumber());

        // Preserve vmsId if not present
        if (user.getVmsId() == null) {
            String prefix = user.getRole() == User.Role.VOLUNTEER ? "VOL-" : "ORG-";
            user.setVmsId(prefix + System.currentTimeMillis() % 1000000);
        }

        // Only update password if a new one is explicitly provided
        // And ensure we don't re-hash an empty string or null
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        String email = user.getEmail();
        String name = user.getName();

        // 1. Delete Support Tickets
        List<com.volunteerhub.model.SupportTicket> tickets = supportTicketRepository
                .findByUserIdOrderByCreatedAtDesc(id);
        supportTicketRepository.deleteAll(tickets);

        // 2. Delete Volunteer History (if volunteer) or Event Volunteers (if
        // organizer's events)
        if (user.getRole() == User.Role.VOLUNTEER) {
            List<com.volunteerhub.model.EventVolunteer> volunteerHistory = eventVolunteerRepository
                    .findByVolunteer(user);
            eventVolunteerRepository.deleteAll(volunteerHistory);
        } else if (user.getRole() == User.Role.ORGANIZER) {
            List<com.volunteerhub.model.Event> events = eventRepository.findByOrganizer(user);
            for (com.volunteerhub.model.Event event : events) {
                // Delete volunteers for each event first
                List<com.volunteerhub.model.EventVolunteer> eventVolunteers = eventVolunteerRepository
                        .findByEvent(event);
                eventVolunteerRepository.deleteAll(eventVolunteers);
            }
            // Then delete the events
            eventRepository.deleteAll(events);
        }

        userRepository.deleteById(id);
        emailService.sendAccountDeletedEmail(email, name);
    }

    @Override
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public java.util.Map<String, Object> getOrganizerDetails(Long id) {
        User user = getUserById(id);
        if (user.getRole() != User.Role.ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }
        List<com.volunteerhub.model.Event> events = eventRepository.findByOrganizer(user);
        return java.util.Map.of(
                "organizer", user,
                "events", events);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        user.setVerified(true);
        user.setVerificationOtp(null);
        user.setOtpExpiry(null);
        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved);

        notificationService.createNotification(
                saved,
                "Welcome!",
                "Welcome to Volunteer Hub. We are glad to have you.",
                com.volunteerhub.model.Notification.NotificationType.INFO);
    }

    @Override
    public void generateForgotPasswordOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        System.out.println("🔐 RESET PASSWORD OTP: " + otp); // Log OTP
        user.setVerificationOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendForgotPasswordEmail(user, otp);

        notificationService.createNotification(
                user,
                "Password Reset Initiated",
                "A password reset email has been sent.",
                com.volunteerhub.model.Notification.NotificationType.WARNING);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }
}

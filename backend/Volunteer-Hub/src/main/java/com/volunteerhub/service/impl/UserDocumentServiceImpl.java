package com.volunteerhub.service.impl;

import com.volunteerhub.model.User;
import com.volunteerhub.model.UserDocument;
import com.volunteerhub.repository.UserDocumentRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.FileStorageService;
import com.volunteerhub.service.UserDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDocumentServiceImpl implements UserDocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final com.volunteerhub.service.EmailService emailService;
    private final com.volunteerhub.service.NotificationService notificationService;

    // Minimum required documents for verification
    private static final int MIN_REQUIRED_DOCUMENTS = 2; // GOV_ID and ADDRESS_PROOF

    @Override
    @Transactional
    public UserDocument uploadDocument(Long userId, MultipartFile file, UserDocument.DocumentType documentType)
            throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Store file
        String filePath = fileStorageService.storeFile(file, userId, documentType.name());

        // Create document record
        UserDocument document = UserDocument.builder()
                .user(user)
                .documentType(documentType)
                .documentUrl(filePath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .verificationStatus(UserDocument.VerificationStatus.PENDING)
                .uploadedAt(LocalDateTime.now())
                .build();

        UserDocument saved = documentRepository.save(document);

        notificationService.notifyAdmins(
                "New Document Uploaded",
                user.getName() + " has uploaded a " + documentType.name() + " for verification.",
                com.volunteerhub.model.Notification.NotificationType.INFO);

        return saved;
    }

    @Override
    public List<UserDocument> getUserDocuments(Long userId) {
        return documentRepository.findByUserId(userId);
    }

    @Override
    public List<UserDocument> getAllPendingDocuments() {
        return documentRepository.findByVerificationStatus(UserDocument.VerificationStatus.PENDING);
    }

    @Override
    public List<UserDocument> getPendingDocumentsByRole(String role) {
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        return documentRepository.findByUserRoleAndStatus(userRole, UserDocument.VerificationStatus.PENDING);
    }

    @Override
    public List<UserDocument> getDocumentsByStatus(UserDocument.VerificationStatus status) {
        return documentRepository.findByVerificationStatus(status);
    }

    @Override
    @Transactional
    public UserDocument verifyDocument(Long documentId, Long adminId, boolean approved, String notes) {
        UserDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can verify documents");
        }

        // Update document status
        document.setVerificationStatus(
                approved ? UserDocument.VerificationStatus.VERIFIED : UserDocument.VerificationStatus.REJECTED);
        document.setVerifiedBy(admin);
        document.setVerifiedAt(LocalDateTime.now());

        if (!approved && notes != null) {
            document.setRejectionReason(notes);
        }

        UserDocument savedDocument = documentRepository.save(document);

        // Notify user if approved
        if (approved) {
            notificationService.createNotification(
                    document.getUser(),
                    "Document Approved",
                    "Your " + document.getDocumentType().name() + " has been approved.",
                    com.volunteerhub.model.Notification.NotificationType.SUCCESS);
        }

        // Notify user if rejected
        if (!approved) {
            emailService.sendDocumentRejectedEmail(document.getUser(),
                    notes != null ? notes : "Missing or invalid document.");

            notificationService.createNotification(
                    document.getUser(),
                    "Document Rejected",
                    "A document was rejected. Please check the verification section.",
                    com.volunteerhub.model.Notification.NotificationType.ERROR);
        }

        // Update user's overall verification status
        updateUserVerificationStatus(document.getUser().getId());

        return savedDocument;
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        UserDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Verify ownership
        if (!document.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own documents");
        }

        // Delete file from storage
        try {
            fileStorageService.deleteFile(document.getDocumentUrl());
        } catch (IOException e) {
            // Log error but continue with database deletion
            System.err.println("Error deleting file: " + e.getMessage());
        }

        // Delete from database
        documentRepository.delete(document);

        // Update user's verification status
        updateUserVerificationStatus(userId);
    }

    @Override
    public boolean isUserVerified(Long userId) {
        long verifiedCount = documentRepository.countVerifiedDocumentsByUserId(userId);

        // Check if user has at least the minimum required verified documents
        if (verifiedCount < MIN_REQUIRED_DOCUMENTS) {
            return false;
        }

        // Check if user has both GOV_ID and ADDRESS_PROOF verified
        List<UserDocument> userDocs = documentRepository.findByUserId(userId);
        boolean hasGovId = userDocs.stream()
                .anyMatch(d -> d.getDocumentType() == UserDocument.DocumentType.GOV_ID
                        && d.getVerificationStatus() == UserDocument.VerificationStatus.VERIFIED);
        boolean hasAddressProof = userDocs.stream()
                .anyMatch(d -> d.getDocumentType() == UserDocument.DocumentType.ADDRESS_PROOF
                        && d.getVerificationStatus() == UserDocument.VerificationStatus.VERIFIED);

        return hasGovId && hasAddressProof;
    }

    @Override
    public UserDocument getDocumentById(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    @Override
    @Transactional
    public void updateUserVerificationStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isVerified = isUserVerified(userId);

        // Only send email if status changed to verified
        if (isVerified && !Boolean.TRUE.equals(user.getDocumentsVerified())) {
            emailService.sendDocumentVerifiedEmail(user);

            notificationService.createNotification(
                    user,
                    "Documents Verified",
                    "Your identity documents have been successfully verified.",
                    com.volunteerhub.model.Notification.NotificationType.SUCCESS);
        }

        user.setDocumentsVerified(isVerified);
        userRepository.save(user);
    }
}

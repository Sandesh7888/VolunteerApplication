package com.volunteerhub.service;

import com.volunteerhub.model.UserDocument;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserDocumentService {

    /**
     * Upload a new document for a user
     */
    UserDocument uploadDocument(Long userId, MultipartFile file, UserDocument.DocumentType documentType)
            throws IOException;

    /**
     * Get all documents for a specific user
     */
    List<UserDocument> getUserDocuments(Long userId);

    /**
     * Get all pending documents (for admin review)
     */
    List<UserDocument> getAllPendingDocuments();

    /**
     * Get pending documents by user role
     */
    List<UserDocument> getPendingDocumentsByRole(String role);

    /**
     * Get documents by verification status
     */
    List<UserDocument> getDocumentsByStatus(UserDocument.VerificationStatus status);

    /**
     * Verify or reject a document (admin only)
     */
    UserDocument verifyDocument(Long documentId, Long adminId, boolean approved, String notes);

    /**
     * Delete a document
     */
    void deleteDocument(Long documentId, Long userId);

    /**
     * Check if user has all required documents verified
     */
    boolean isUserVerified(Long userId);

    /**
     * Get document by ID
     */
    UserDocument getDocumentById(Long documentId);

    /**
     * Update user's overall verification status
     */
    void updateUserVerificationStatus(Long userId);
}

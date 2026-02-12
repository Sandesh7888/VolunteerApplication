package com.volunteerhub.controller;

import com.volunteerhub.model.UserDocument;
import com.volunteerhub.service.FileStorageService;
import com.volunteerhub.service.UserDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class UserDocumentController {

    private final UserDocumentService documentService;
    private final FileStorageService fileStorageService;

    /**
     * Upload a document for the current user
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("documentType") String documentType) {
        try {
            UserDocument.DocumentType type = UserDocument.DocumentType.valueOf(documentType.toUpperCase());
            UserDocument document = documentService.uploadDocument(userId, file, type);
            return ResponseEntity.ok(document);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type"));
        }
    }

    /**
     * Get all documents for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserDocument>> getUserDocuments(@PathVariable Long userId) {
        List<UserDocument> documents = documentService.getUserDocuments(userId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get all pending documents (Admin only)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<UserDocument>> getAllPendingDocuments() {
        List<UserDocument> documents = documentService.getAllPendingDocuments();
        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by status
     */
    @GetMapping
    public ResponseEntity<List<UserDocument>> getDocumentsByStatus(@RequestParam String status) {
        try {
            UserDocument.VerificationStatus verificationStatus = UserDocument.VerificationStatus
                    .valueOf(status.toUpperCase());
            List<UserDocument> documents = documentService.getDocumentsByStatus(verificationStatus);
            return ResponseEntity.ok(documents);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Get pending documents by role (Admin only)
     */
    @GetMapping("/pending/{role}")
    public ResponseEntity<List<UserDocument>> getPendingDocumentsByRole(@PathVariable String role) {
        try {
            List<UserDocument> documents = documentService.getPendingDocumentsByRole(role);
            return ResponseEntity.ok(documents);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Verify or reject a document (Admin only)
     */
    @PutMapping("/{documentId}/verify")
    public ResponseEntity<?> verifyDocument(
            @PathVariable Long documentId,
            @RequestParam Long adminId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String notes) {
        try {
            UserDocument document = documentService.verifyDocument(documentId, adminId, approved, notes);
            return ResponseEntity.ok(document);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a document
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long documentId,
            @RequestParam Long userId) {
        try {
            documentService.deleteDocument(documentId, userId);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Download a document file
     */
    @GetMapping("/download/{userId}/{fileName:.+}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long userId, @PathVariable String fileName) {
        try {
            String fullPath = userId + "/" + fileName;
            Resource resource = fileStorageService.loadFileAsResource(fullPath);

            String contentType = "application/octet-stream";

            // Try to determine content type
            try {
                contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
            } catch (Exception ex) {
                // Fallback to octet-stream
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Check if user is verified
     */
    @GetMapping("/user/{userId}/verified")
    public ResponseEntity<Map<String, Boolean>> isUserVerified(@PathVariable Long userId) {
        boolean isVerified = documentService.isUserVerified(userId);
        return ResponseEntity.ok(Map.of("verified", isVerified));
    }
}

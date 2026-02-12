package com.volunteerhub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false, length = 500)
    private String documentUrl;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column
    private LocalDateTime verifiedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column
    private Long fileSize; // in bytes

    @Column(length = 100)
    private String mimeType;

    public enum DocumentType {
        GOV_ID, // Government ID (Passport, Driver's License, National ID)
        ADDRESS_PROOF, // Address Proof (Utility Bill, Bank Statement)
        EDUCATIONAL_CERT, // Educational Certificate
        BACKGROUND_CHECK, // Background Check Document
        PROFESSIONAL_CERT, // Professional Certification
        OTHER // Other documents
    }

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (verificationStatus == VerificationStatus.VERIFIED && verifiedAt == null) {
            verifiedAt = LocalDateTime.now();
        }
    }
}

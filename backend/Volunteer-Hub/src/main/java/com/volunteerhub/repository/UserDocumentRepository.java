package com.volunteerhub.repository;

import com.volunteerhub.model.User;
import com.volunteerhub.model.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {

        List<UserDocument> findByUserId(Long userId);

        List<UserDocument> findByVerificationStatus(UserDocument.VerificationStatus status);

        @Query("SELECT d FROM UserDocument d WHERE d.user.role = :role")
        List<UserDocument> findByUserRole(@Param("role") User.Role role);

        @Query("SELECT d FROM UserDocument d WHERE d.user.role = :role AND d.verificationStatus = :status")
        List<UserDocument> findByUserRoleAndStatus(@Param("role") User.Role role,
                        @Param("status") UserDocument.VerificationStatus status);

        @Query("SELECT d FROM UserDocument d WHERE d.user.id = :userId AND d.documentType = :type")
        List<UserDocument> findByUserIdAndDocumentType(@Param("userId") Long userId,
                        @Param("type") UserDocument.DocumentType type);

        @Query("SELECT COUNT(d) FROM UserDocument d WHERE d.user.id = :userId AND d.verificationStatus = 'VERIFIED'")
        long countVerifiedDocumentsByUserId(@Param("userId") Long userId);

        @Query("SELECT COUNT(d) FROM UserDocument d WHERE d.user.id = :userId AND d.verificationStatus = 'PENDING'")
        long countPendingDocumentsByUserId(@Param("userId") Long userId);

        void deleteByUserId(Long userId);
}

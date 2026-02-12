package com.volunteerhub.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

public interface FileStorageService {

    /**
     * Store a file and return the file path
     */
    String storeFile(MultipartFile file, Long userId, String documentType) throws IOException;

    String storeCertificate(MultipartFile file, Long registrationId) throws IOException;

    /**
     * Load a file as a resource
     */
    org.springframework.core.io.Resource loadFileAsResource(String fileName) throws IOException;

    /**
     * Delete a file
     */
    void deleteFile(String fileName) throws IOException;

    /**
     * Get the upload directory path
     */
    Path getUploadPath();

    /**
     * Validate file (type, size, etc.)
     */
    boolean validateFile(MultipartFile file);
}

package com.volunteerhub.service.impl;

import com.volunteerhub.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path uploadPath;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf"); // Restrict to only PDF

    public FileStorageServiceImpl() {
        // Store files in backend/uploads/documents
        this.uploadPath = Paths.get("uploads/documents").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
            Files.createDirectories(this.uploadPath.resolve("certificates"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, Long userId, String documentType) throws IOException {
        if (!validateFile(file)) {
            throw new IOException("Invalid file type or size");
        }

        // Create user-specific directory
        Path userPath = uploadPath.resolve(String.valueOf(userId));
        Files.createDirectories(userPath);

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = documentType + "_" + UUID.randomUUID().toString() + extension;

        // Store file
        Path targetLocation = userPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return userId + "/" + uniqueFilename;
    }

    @Override
    public String storeCertificate(MultipartFile file, Long registrationId) throws IOException {
        if (!validateFile(file)) {
            throw new IOException("Invalid file type or size");
        }

        Path certPath = uploadPath.resolve("certificates");
        Files.createDirectories(certPath);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = "CERT_" + registrationId + "_" + UUID.randomUUID().toString() + extension;

        Path targetLocation = certPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "certificates/" + uniqueFilename;
    }

    @Override
    public Resource loadFileAsResource(String fileName) throws IOException {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IOException("File not found: " + fileName);
            }
        } catch (Exception e) {
            throw new IOException("Error loading file: " + fileName, e);
        }
    }

    @Override
    public void deleteFile(String fileName) throws IOException {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new IOException("Error deleting file: " + fileName, e);
        }
    }

    @Override
    public Path getUploadPath() {
        return uploadPath;
    }

    @Override
    public boolean validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return false;
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null) {
            return false;
        }

        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }
}

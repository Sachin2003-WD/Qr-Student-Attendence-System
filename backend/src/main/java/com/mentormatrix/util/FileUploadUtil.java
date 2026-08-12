package com.mentormatrix.util;

import com.mentormatrix.constants.AppConstants;
import com.mentormatrix.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

@Component
public class FileUploadUtil {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FileUploadUtil.class);

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String subDir) {
        try {
            Path uploadPath = Paths.get(uploadDir, subDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created directories: {}", uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath);
            log.info("Saved file: {}", filePath);

            return subDir + "/" + uniqueFilename;
        } catch (IOException e) {
            log.error("Could not save file", e);
            throw new BadRequestException("Could not save file: " + e.getMessage());
        }
    }

    public void deleteFile(String filePath) {
        try {
            if (filePath != null && !filePath.isEmpty()) {
                Path path = Paths.get(uploadDir, filePath);
                boolean deleted = Files.deleteIfExists(path);
                if (deleted) {
                    log.info("Deleted file: {}", path);
                } else {
                    log.warn("File not found for deletion: {}", path);
                }
            }
        } catch (IOException e) {
            log.error("Could not delete file: {}", filePath, e);
        }
    }

    public void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty or null.");
        }

        if (file.getSize() > AppConstants.MAX_PROFILE_IMAGE_SIZE) {
            throw new BadRequestException("File size exceeds the maximum limit of 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !Arrays.asList(AppConstants.ALLOWED_IMAGE_TYPES).contains(contentType)) {
            throw new BadRequestException("Invalid file type. Allowed types are: " + String.join(", ", AppConstants.ALLOWED_IMAGE_TYPES));
        }
    }
}

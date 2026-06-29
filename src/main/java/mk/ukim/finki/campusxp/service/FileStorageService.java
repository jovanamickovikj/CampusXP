package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

/**
 * Stores uploaded files on the local filesystem.
 *
 * Files are saved to {@code file.upload-dir} (default: "uploads/") and served
 * by FileUploadController at GET /api/files/{filename}.
 */
@Service
public class FileStorageService {

    private static final long MAX_SIZE_BYTES = 50L * 1024 * 1024; // 50 MB

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "video/mp4", "video/webm", "video/ogg"
    );

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDirPath) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDirPath, e);
        }
    }

    /**
     * Validates, stores, and returns the public URL path for the file.
     * e.g. "/api/files/abc123-photo.jpg"
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("File exceeds maximum allowed size of 50 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("File type not allowed. Supported: images (JPG/PNG/GIF/WEBP), PDF, video (MP4/WEBM/OGG)");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String extension    = getExtension(originalName);
        String storedName   = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        try {
            Path target = uploadDir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        return "/api/files/" + storedName;
    }

    /** Returns the Path for a stored filename — used by the file-serving endpoint. */
    public Path load(String filename) {
        return uploadDir.resolve(filename).normalize();
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return (dot >= 0) ? filename.substring(dot + 1).toLowerCase() : "";
    }
}

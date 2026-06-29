package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Map;

/**
 * POST /api/upload       — upload a file, returns { "url": "/api/files/{name}" }
 * GET  /api/files/{name} — serve an uploaded file (publicly accessible)
 */
@RestController
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /** Authenticated users upload a file. Returns the public URL. */
    @PostMapping("/api/upload")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        return Map.of("url", url);
    }

    /** Publicly serve stored files (needed to render images/pdfs in feed). */
    @GetMapping("/api/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.load(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Detect content type from extension
            String contentType = detectContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String detectContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".mp4"))  return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".ogg"))  return "video/ogg";
        return "application/octet-stream";
    }
}

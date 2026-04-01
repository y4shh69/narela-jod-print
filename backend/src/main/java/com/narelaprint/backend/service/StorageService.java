package com.narelaprint.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

@Service
public class StorageService {

    private final Path uploadsRoot;
    private final Path previewsRoot;

    public StorageService(@Value("${app.storage.upload-dir}") String uploadDir) {
        this.uploadsRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.previewsRoot = this.uploadsRoot.resolve("previews");
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(uploadsRoot);
        Files.createDirectories(previewsRoot);
    }

    public StoredFile store(MultipartFile file) throws IOException {
        String safeName = file.getOriginalFilename() == null ? "upload.bin" : file.getOriginalFilename().replaceAll("\\s+", "-");
        String storedName = Instant.now().toEpochMilli() + "-" + safeName;
        Path target = uploadsRoot.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return new StoredFile(storedName, safeName, target, "/uploads/" + storedName);
    }

    public Path previewsRoot() {
        return previewsRoot;
    }

    public String uploadsRootUri() {
        return uploadsRoot.toUri().toString();
    }

    public record StoredFile(String storedName, String originalName, Path path, String publicUrl) {
    }
}

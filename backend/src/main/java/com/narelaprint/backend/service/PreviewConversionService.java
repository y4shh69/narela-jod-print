package com.narelaprint.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class PreviewConversionService {

    private final StorageService storageService;

    @Value("${SOFFICE_PATH:soffice}")
    private String sofficePath;

    public String convertOfficeToPdf(StorageService.StoredFile storedFile) throws IOException, InterruptedException {
        Path outputPath = storageService.previewsRoot().resolve(storedFile.path().getFileName().toString().replaceFirst("\\.[^.]+$", ".pdf"));
        Process process = new ProcessBuilder(
                sofficePath,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                storageService.previewsRoot().toString(),
                storedFile.path().toString()
        ).redirectErrorStream(true).start();

        int exitCode = process.waitFor();
        if (exitCode != 0 || !Files.exists(outputPath)) {
            String output = new String(process.getInputStream().readAllBytes());
            throw new IllegalStateException(output.isBlank()
                    ? "LibreOffice is not installed on the server. Install LibreOffice and ensure `soffice` is available in PATH."
                    : output);
        }

        return "/uploads/previews/" + outputPath.getFileName();
    }
}

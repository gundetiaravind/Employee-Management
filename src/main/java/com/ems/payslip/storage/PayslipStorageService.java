
package com.ems.payslip.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class PayslipStorageService {

    @Value("${app.payslip.storage-dir:uploads/payslips}")
    private String storageDirectory;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public String store(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Payslip file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Payslip file must not exceed 10 MB");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null ||
                !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        byte[] fileBytes = file.getBytes();

        if (fileBytes.length < 5 ||
                fileBytes[0] != '%' ||
                fileBytes[1] != 'P' ||
                fileBytes[2] != 'D' ||
                fileBytes[3] != 'F' ||
                fileBytes[4] != '-') {
            throw new IllegalArgumentException("Invalid PDF file");
        }

        Path directory = Paths.get(storageDirectory)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(directory);

        String storedFilename = UUID.randomUUID() + ".pdf";

        Path destination = directory.resolve(storedFilename);

        Files.write(destination, fileBytes);

        return storedFilename;
    }

    public byte[] load(String fileReference) throws IOException {

        Path filePath = getFilePath(fileReference);

        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            throw new IOException("Payslip file not found");
        }

        return Files.readAllBytes(filePath);
    }

    public void delete(String fileReference) throws IOException {

        Path filePath = getFilePath(fileReference);

        Files.deleteIfExists(filePath);
    }

    private Path getFilePath(String fileReference) {

        if (fileReference == null ||
                !fileReference.matches(
                        "^[a-fA-F0-9-]{36}\\.pdf$")) {
            throw new IllegalArgumentException(
                    "Invalid payslip file reference");
        }

        Path directory = Paths.get(storageDirectory)
                .toAbsolutePath()
                .normalize();

        Path filePath = directory.resolve(fileReference).normalize();

        if (!filePath.startsWith(directory)) {
            throw new IllegalArgumentException(
                    "Invalid file reference");
        }

        return filePath;
    }
}

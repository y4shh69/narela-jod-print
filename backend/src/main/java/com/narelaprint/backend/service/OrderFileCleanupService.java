package com.narelaprint.backend.service;

import com.narelaprint.backend.entity.OrderItem;
import com.narelaprint.backend.entity.PrintOrder;
import com.narelaprint.backend.repository.PrintOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderFileCleanupService {

    private final PrintOrderRepository printOrderRepository;
    private final StorageService storageService;

    @Scheduled(cron = "${app.storage.cleanup-cron:0 30 2 * * *}")
    public void cleanupExpiredOrderFiles() {
        cleanupOrderFiles("cancelled", 7);
        cleanupOrderFiles("delivered", 15);
    }

    private void cleanupOrderFiles(String status, long retentionDays) {
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        List<PrintOrder> orders = printOrderRepository.findByOrderStatusAndUpdatedAtBefore(status, cutoff);

        for (PrintOrder order : orders) {
            boolean changed = false;

            String paymentScreenshotUrl = order.getPaymentScreenshotUrl();
            if (paymentScreenshotUrl != null && !paymentScreenshotUrl.isBlank()) {
                try {
                    storageService.deleteByPublicUrl(paymentScreenshotUrl);
                    order.setPaymentScreenshotUrl(null);
                    order.setPaymentScreenshotName(null);
                    changed = true;
                } catch (IOException exception) {
                    log.warn("Failed to delete payment screenshot for order {}: {}", order.getPublicId(), paymentScreenshotUrl, exception);
                }
            }

            for (OrderItem item : order.getItems()) {
                String fileUrl = item.getFileUrl();
                if (fileUrl == null || fileUrl.isBlank()) {
                    continue;
                }

                try {
                    storageService.deleteByPublicUrl(fileUrl);
                    item.setFileUrl(null);
                    changed = true;
                } catch (IOException exception) {
                    log.warn("Failed to delete stored file for order {} item {}: {}", order.getPublicId(), item.getId(), fileUrl, exception);
                }
            }

            if (changed) {
                printOrderRepository.save(order);
            }
        }
    }
}

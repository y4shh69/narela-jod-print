package com.narelaprint.backend.service;

import com.narelaprint.backend.dto.SiteContentResponse;
import com.narelaprint.backend.dto.SiteContentUpdateRequest;
import com.narelaprint.backend.entity.SiteContent;
import com.narelaprint.backend.repository.PrintOrderRepository;
import com.narelaprint.backend.repository.SiteContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteContentService {

    private static final ZoneId INDIA_ZONE = ZoneId.of("Asia/Calcutta");
    private final SiteContentRepository siteContentRepository;
    private final PrintOrderRepository printOrderRepository;

    public SiteContentResponse getContent() {
        return toResponse(getOrCreate());
    }

    public SiteContentResponse updateContent(SiteContentUpdateRequest request) {
        SiteContent content = getOrCreate();
        content.setBannerLabel(cleanOrDefault(request.bannerLabel(), "Today's update"));
        content.setDailyOffer(cleanOrDefault(request.dailyOffer(), "A4 B&W prints from Rs 2/page for online and delivery orders."));
        content.setDailyMessage(cleanOrDefault(request.dailyMessage(), "Same-day delivery is available on most standard jobs received before evening."));
        content.setShopStatus(cleanOrDefault(request.shopStatus(), "Delivery active"));
        content.setTurnaroundTime(cleanOrDefault(request.turnaroundTime(), "Most jobs ready within 30-60 minutes"));
        content.setPrimaryMetricLabel(cleanOrDefault(request.primaryMetricLabel(), "Jobs completed today"));
        content.setSecondaryMetricLabel(cleanOrDefault(request.secondaryMetricLabel(), "Orders in progress"));
        return toResponse(siteContentRepository.save(content));
    }

    private SiteContent getOrCreate() {
        return siteContentRepository.findById(1L).orElseGet(() -> {
            SiteContent content = new SiteContent();
            content.setId(1L);
            content.setBannerLabel("Today's update");
            content.setDailyOffer("A4 B&W prints from Rs 2/page for online and delivery orders.");
            content.setDailyMessage("Same-day delivery is available on most standard jobs received before evening.");
            content.setShopStatus("Delivery active");
            content.setTurnaroundTime("Most jobs ready within 30-60 minutes");
            content.setPrimaryMetricLabel("Jobs completed today");
            content.setSecondaryMetricLabel("Orders in progress");
            return siteContentRepository.save(content);
        });
    }

    private SiteContentResponse toResponse(SiteContent content) {
        List<String> finishedStatuses = List.of("ready", "out_for_delivery", "delivered");
        Instant dayStart = LocalDate.now(INDIA_ZONE).atStartOfDay(INDIA_ZONE).toInstant();

        long completedToday = printOrderRepository.findAll().stream()
                .filter(order -> order.getUpdatedAt() != null && order.getUpdatedAt().isAfter(dayStart))
                .filter(order -> finishedStatuses.contains(order.getOrderStatus()))
                .count();

        long activeOrders = printOrderRepository.findAll().stream()
                .filter(order -> !List.of("delivered", "cancelled").contains(order.getOrderStatus()))
                .count();

        return new SiteContentResponse(
                content.getBannerLabel(),
                content.getDailyOffer(),
                content.getDailyMessage(),
                content.getShopStatus(),
                content.getTurnaroundTime(),
                content.getPrimaryMetricLabel(),
                String.valueOf(completedToday),
                content.getSecondaryMetricLabel(),
                String.valueOf(activeOrders),
                content.getUpdatedAt()
        );
    }

    private String cleanOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}

package com.narelaprint.backend.dto;

import java.time.Instant;

public record SiteContentResponse(
        String bannerLabel,
        String dailyOffer,
        String dailyMessage,
        String shopStatus,
        boolean shopOpen,
        String turnaroundTime,
        String primaryMetricLabel,
        String primaryMetricValue,
        String secondaryMetricLabel,
        String secondaryMetricValue,
        Integer deliveryCharge,
        Instant updatedAt
) {
}

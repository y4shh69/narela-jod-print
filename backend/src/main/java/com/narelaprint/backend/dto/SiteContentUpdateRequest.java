package com.narelaprint.backend.dto;

public record SiteContentUpdateRequest(
        String bannerLabel,
        String dailyOffer,
        String dailyMessage,
        String shopStatus,
        String turnaroundTime,
        String primaryMetricLabel,
        String secondaryMetricLabel
) {
}

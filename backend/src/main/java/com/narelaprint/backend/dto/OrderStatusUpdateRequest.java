package com.narelaprint.backend.dto;

public record OrderStatusUpdateRequest(
        String status,
        String trackingMessage
) {
}

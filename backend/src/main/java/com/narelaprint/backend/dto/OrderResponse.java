package com.narelaprint.backend.dto;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String name,
        String phone,
        String address,
        String fulfillmentMethod,
        String paymentMethod,
        String paymentScreenshotName,
        String paymentScreenshotUrl,
        String notes,
        String orderStatus,
        String trackingMessage,
        Integer itemCount,
        Integer totalAmount,
        Instant createdAt,
        Instant updatedAt,
        List<OrderItemResponse> items
) {
}

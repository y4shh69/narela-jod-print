package com.narelaprint.backend.dto;

public record UpdateOrderStatusRequest(
        String status,
        String trackingMessage
) {
}

package com.narelaprint.backend.dto;

public record TrackOrderRequest(
        String orderId,
        String phone
) {
}

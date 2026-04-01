package com.narelaprint.backend.dto;

public record AdminAuthResponse(
        boolean authenticated,
        String username
) {
}

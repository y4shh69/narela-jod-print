package com.narelaprint.backend.dto;

public record AdminLoginRequest(
        String username,
        String password
) {
}

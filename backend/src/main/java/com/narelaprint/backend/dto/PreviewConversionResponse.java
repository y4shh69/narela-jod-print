package com.narelaprint.backend.dto;

public record PreviewConversionResponse(
        boolean success,
        String previewUrl,
        String sourceFileUrl,
        String convertedWith
) {
}

package com.narelaprint.backend.dto;

public record ServiceCatalogItemResponse(
        String code,
        String title,
        String category,
        String description,
        String priceLabel,
        String unitLabel,
        Boolean featured,
        Boolean active,
        Integer sortOrder
) {
}

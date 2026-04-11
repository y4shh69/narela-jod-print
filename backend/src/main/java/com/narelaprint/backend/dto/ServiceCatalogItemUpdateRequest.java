package com.narelaprint.backend.dto;

public record ServiceCatalogItemUpdateRequest(
        String code,
        String title,
        String category,
        String description,
        String priceLabel,
        Integer basePrice,
        String unitLabel,
        Boolean featured,
        Boolean active,
        Integer sortOrder
) {
}

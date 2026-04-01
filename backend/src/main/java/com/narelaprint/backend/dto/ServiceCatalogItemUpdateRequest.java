package com.narelaprint.backend.dto;

public record ServiceCatalogItemUpdateRequest(
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

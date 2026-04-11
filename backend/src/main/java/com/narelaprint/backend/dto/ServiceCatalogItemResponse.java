package com.narelaprint.backend.dto;

public record ServiceCatalogItemResponse(
        String code,
        String title,
        String category,
        String description,
        String priceLabel,
        Integer basePrice,
        String unitLabel,
        String imageName,
        String imageUrl,
        Boolean featured,
        Boolean active,
        Integer sortOrder
) {
}

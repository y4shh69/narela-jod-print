package com.narelaprint.backend.dto;

import java.util.List;

public record ServiceCatalogResponse(
        List<ServiceCatalogItemResponse> items
) {
}

package com.narelaprint.backend.dto;

import java.util.List;

public record ServiceCatalogUpdateRequest(
        List<ServiceCatalogItemUpdateRequest> items
) {
}

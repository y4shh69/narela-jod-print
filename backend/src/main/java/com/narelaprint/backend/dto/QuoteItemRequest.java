package com.narelaprint.backend.dto;

public record QuoteItemRequest(
        String tempId,
        String displayName,
        String fileType,
        String serviceCode,
        String serviceTitle,
        String colorMode,
        String paperSize,
        String orientation,
        String printSide,
        Integer pages,
        Integer copies,
        String pageRange,
        String bindingType,
        Boolean lamination,
        String scaleType,
        String finishType,
        String materialType,
        String customSize,
        String priorityLevel,
        String productVariant,
        String notes
) {
}

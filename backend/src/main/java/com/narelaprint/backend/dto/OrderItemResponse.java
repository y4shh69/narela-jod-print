package com.narelaprint.backend.dto;

public record OrderItemResponse(
        Long id,
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
        Integer printablePages,
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
        String notes,
        Integer unitPrice,
        Integer totalPrice,
        String fileName,
        String fileUrl
) {
}

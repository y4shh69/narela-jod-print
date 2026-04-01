package com.narelaprint.backend.dto;

public record QuoteItemResponse(
        String tempId,
        Integer pages,
        Integer copies,
        Integer printablePages,
        Integer unitPrice,
        Integer totalPrice
) {
}

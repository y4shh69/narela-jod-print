package com.narelaprint.backend.dto;

import java.util.List;

public record QuoteResponse(
        List<QuoteItemResponse> items,
        Integer subtotal,
        Integer total
) {
}

package com.narelaprint.backend.dto;

import java.util.List;

public record QuoteRequest(List<QuoteItemRequest> items) {
}

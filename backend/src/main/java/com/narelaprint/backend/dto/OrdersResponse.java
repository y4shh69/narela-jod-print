package com.narelaprint.backend.dto;

import java.util.List;

public record OrdersResponse(List<OrderResponse> orders) {
}

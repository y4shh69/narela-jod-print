package com.narelaprint.backend.service;

import com.narelaprint.backend.dto.QuoteItemRequest;
import com.narelaprint.backend.dto.QuoteItemResponse;
import com.narelaprint.backend.dto.QuoteRequest;
import com.narelaprint.backend.dto.QuoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingService {

    public QuoteResponse quote(QuoteRequest request) {
        List<QuoteItemResponse> items = request.items() == null
                ? List.of()
                : request.items().stream().map(this::calculate).toList();
        int subtotal = items.stream().mapToInt(QuoteItemResponse::totalPrice).sum();
        return new QuoteResponse(items, subtotal, subtotal);
    }

    public QuoteItemResponse calculate(QuoteItemRequest item) {
        int pages = Math.max(item.pages() == null ? 1 : item.pages(), 1);
        int copies = Math.max(item.copies() == null ? 1 : item.copies(), 1);
        String pageRange = item.pageRange() == null ? "all" : item.pageRange().trim().toLowerCase();
        boolean allPages = pageRange.isBlank() || pageRange.equals("all");
        int printablePages = allPages ? pages : Math.min(pages, estimateSelectedPages(pageRange, pages));
        int colorRate = "color".equalsIgnoreCase(item.colorMode()) ? 10 : 2;
        double sizeMultiplier = switch (item.paperSize()) {
            case "A3" -> 1.8;
            case "Legal" -> 1.25;
            default -> 1.0;
        };
        double sideMultiplier = "double".equalsIgnoreCase(item.printSide()) ? 0.9 : 1.0;
        int laminationCost = Boolean.TRUE.equals(item.lamination()) ? 25 : 0;
        int bindingCost = switch (item.bindingType() == null ? "none" : item.bindingType().toLowerCase()) {
            case "spiral" -> 35;
            case "hard" -> 80;
            case "staple" -> 10;
            default -> 0;
        };

        int unitPrice = Math.max((int) Math.round(printablePages * colorRate * sizeMultiplier * sideMultiplier) + laminationCost + bindingCost, colorRate);
        return new QuoteItemResponse(item.tempId(), pages, copies, printablePages, unitPrice, unitPrice * copies);
    }

    private int estimateSelectedPages(String pageRange, int maxPages) {
        return java.util.Arrays.stream(pageRange.split(","))
                .map(String::trim)
                .filter(segment -> !segment.isBlank())
                .mapToInt(segment -> {
                    if (segment.contains("-")) {
                        String[] parts = segment.split("-");
                        if (parts.length != 2) return 0;
                        try {
                            int start = Integer.parseInt(parts[0].trim());
                            int end = Integer.parseInt(parts[1].trim());
                            return Math.max(Math.min(end, maxPages) - Math.max(start, 1) + 1, 0);
                        } catch (NumberFormatException ex) {
                            return 0;
                        }
                    }

                    try {
                        int page = Integer.parseInt(segment);
                        return page >= 1 && page <= maxPages ? 1 : 0;
                    } catch (NumberFormatException ex) {
                        return 0;
                    }
                })
                .sum();
    }
}

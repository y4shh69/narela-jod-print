package com.narelaprint.backend.service;

import com.narelaprint.backend.dto.QuoteItemRequest;
import com.narelaprint.backend.dto.QuoteItemResponse;
import com.narelaprint.backend.dto.QuoteRequest;
import com.narelaprint.backend.dto.QuoteResponse;
import com.narelaprint.backend.entity.ServiceCatalogItem;
import com.narelaprint.backend.repository.ServiceCatalogRepository;
import com.narelaprint.backend.repository.SiteContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final SiteContentRepository siteContentRepository;

    public QuoteResponse quote(QuoteRequest request) {
        List<QuoteItemResponse> items = request.items() == null
                ? List.of()
                : request.items().stream().map(item -> calculate(item, request.fulfillmentMethod())).toList();
        int subtotal = items.stream().mapToInt(QuoteItemResponse::totalPrice).sum();
        int deliveryCharge = deliveryChargeFor(request.fulfillmentMethod());
        return new QuoteResponse(items, subtotal, deliveryCharge, subtotal + deliveryCharge);
    }

    public QuoteItemResponse calculate(QuoteItemRequest item) {
        return calculate(item, "pickup");
    }

    public QuoteItemResponse calculate(QuoteItemRequest item, String fulfillmentMethod) {
        int pages = Math.max(item.pages() == null ? 1 : item.pages(), 1);
        int copies = Math.max(item.copies() == null ? 1 : item.copies(), 1);
        String pageRange = item.pageRange() == null ? "all" : item.pageRange().trim().toLowerCase();
        boolean allPages = pageRange.isBlank() || pageRange.equals("all");
        int printablePages = allPages ? pages : Math.min(pages, estimateSelectedPages(pageRange, pages));
        int basePrice = resolveBasePrice(item);
        double colorMultiplier = "color".equalsIgnoreCase(item.colorMode()) ? 5.0 : 1.0;
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

        int unitPrice = Math.max((int) Math.round(printablePages * basePrice * colorMultiplier * sizeMultiplier * sideMultiplier) + laminationCost + bindingCost, basePrice);
        return new QuoteItemResponse(item.tempId(), pages, copies, printablePages, unitPrice, unitPrice * copies);
    }

    private int resolveBasePrice(QuoteItemRequest item) {
        if (item == null || item.serviceCode() == null || item.serviceCode().isBlank()) {
            return 2;
        }

        return serviceCatalogRepository.findByCode(item.serviceCode().trim().toLowerCase(Locale.ROOT))
                .map(ServiceCatalogItem::getBasePrice)
                .filter(value -> value != null && value > 0)
                .orElseGet(() -> inferPriceFromText(item.serviceTitle()));
    }

    public int deliveryChargeFor(String fulfillmentMethod) {
        if (!"delivery".equalsIgnoreCase(fulfillmentMethod == null ? "" : fulfillmentMethod.trim())) {
            return 0;
        }

        return siteContentRepository.findById(1L)
                .map(content -> content.getDeliveryCharge() == null ? 30 : Math.max(content.getDeliveryCharge(), 0))
                .orElse(30);
    }

    private int inferPriceFromText(String value) {
        if (value == null || value.isBlank()) {
            return 2;
        }
        String digits = value.replaceAll("[^0-9]", "");
        if (digits.isBlank()) {
            return 2;
        }
        try {
            return Math.max(Integer.parseInt(digits), 1);
        } catch (NumberFormatException ex) {
            return 2;
        }
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


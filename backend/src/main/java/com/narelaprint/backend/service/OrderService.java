package com.narelaprint.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.narelaprint.backend.dto.OrderItemResponse;
import com.narelaprint.backend.dto.OrderResponse;
import com.narelaprint.backend.dto.QuoteItemRequest;
import com.narelaprint.backend.dto.TrackOrderRequest;
import com.narelaprint.backend.dto.UpdateOrderStatusRequest;
import com.narelaprint.backend.entity.OrderItem;
import com.narelaprint.backend.entity.PrintOrder;
import com.narelaprint.backend.repository.PrintOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PrintOrderRepository printOrderRepository;
    private final PricingService pricingService;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;

    public List<OrderResponse> findAll() {
        return printOrderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse updateStatus(String publicId, UpdateOrderStatusRequest request) {
        PrintOrder order = printOrderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String normalizedStatus = normalizeStatus(request.status());
        order.setOrderStatus(normalizedStatus);
        order.setTrackingMessage(defaultTrackingMessage(normalizedStatus, request.trackingMessage()));

        return toResponse(printOrderRepository.save(order));
    }

    public OrderResponse trackOrder(TrackOrderRequest request) {
        if (request == null || isBlank(request.orderId()) || isBlank(request.phone())) {
            throw new IllegalArgumentException("Order ID and phone number are required");
        }

        PrintOrder order = printOrderRepository.findByPublicId(request.orderId().trim())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String submittedPhone = digitsOnly(request.phone());
        String orderPhone = digitsOnly(order.getPhone());
        if (!submittedPhone.equals(orderPhone)) {
            throw new IllegalArgumentException("Phone number does not match this order");
        }

        return toResponse(order);
    }

    public OrderResponse createOrder(
            String name,
            String phone,
            String address,
            String fulfillmentMethod,
            String paymentMethod,
            String notes,
            String itemsJson,
            MultipartFile[] files,
            MultipartFile paymentScreenshot
    )
            throws IOException {
        List<QuoteItemRequest> items = objectMapper.readValue(itemsJson, new TypeReference<>() {
        });
        if (items.isEmpty()) {
            throw new IllegalArgumentException("At least one document is required");
        }

        String normalizedMethod = normalizeFulfillmentMethod(fulfillmentMethod);
        String normalizedAddress = normalizedMethod.equals("pickup") ? "" : (address == null ? "" : address.trim());

        if (isBlank(name)) {
            throw new IllegalArgumentException("Name is required");
        }
        if (isBlank(phone)) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (normalizedMethod.equals("delivery") && isBlank(normalizedAddress)) {
            throw new IllegalArgumentException("Delivery address is required");
        }
        if (paymentScreenshot == null || paymentScreenshot.isEmpty()) {
            throw new IllegalArgumentException("Payment screenshot is required");
        }
        String normalizedPaymentMethod = isBlank(paymentMethod) ? "upi_qr" : paymentMethod.trim().toLowerCase(Locale.ROOT);
        if (!"upi_qr".equals(normalizedPaymentMethod)) {
            throw new IllegalArgumentException("Unsupported payment method");
        }

        PrintOrder order = new PrintOrder();
        order.setPublicId("ORD-" + Instant.now().toEpochMilli());
        order.setName(name.trim());
        order.setPhone(phone.trim());
        order.setAddress(normalizedAddress);
        order.setFulfillmentMethod(normalizedMethod);
        order.setPaymentMethod(normalizedPaymentMethod);
        order.setNotes(notes);
        order.setOrderStatus("submitted");
        order.setTrackingMessage(defaultInitialTrackingMessage(normalizedMethod));

        StorageService.StoredFile storedPaymentScreenshot = storageService.store(paymentScreenshot);
        order.setPaymentScreenshotName(storedPaymentScreenshot.originalName());
        order.setPaymentScreenshotUrl(storedPaymentScreenshot.publicUrl());

        List<OrderItem> orderItems = new ArrayList<>();
        int totalAmount = 0;

        for (int index = 0; index < items.size(); index++) {
            QuoteItemRequest itemRequest = items.get(index);
            var priced = pricingService.calculate(itemRequest);
            StorageService.StoredFile storedFile = (files != null && index < files.length) ? storageService.store(files[index]) : null;

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setTempId(itemRequest.tempId());
            item.setDisplayName(itemRequest.displayName());
            item.setFileType(itemRequest.fileType());
            item.setServiceCode(itemRequest.serviceCode());
            item.setServiceTitle(itemRequest.serviceTitle());
            item.setColorMode(itemRequest.colorMode());
            item.setPaperSize(itemRequest.paperSize());
            item.setOrientation(itemRequest.orientation());
            item.setPrintSide(itemRequest.printSide());
            item.setPages(priced.pages());
            item.setPrintablePages(priced.printablePages());
            item.setCopies(priced.copies());
            item.setPageRange(itemRequest.pageRange());
            item.setBindingType(itemRequest.bindingType());
            item.setLamination(Boolean.TRUE.equals(itemRequest.lamination()));
            item.setScaleType(itemRequest.scaleType());
            item.setFinishType(itemRequest.finishType());
            item.setMaterialType(itemRequest.materialType());
            item.setCustomSize(itemRequest.customSize());
            item.setPriorityLevel(itemRequest.priorityLevel());
            item.setProductVariant(itemRequest.productVariant());
            item.setNotes(itemRequest.notes());
            item.setUnitPrice(priced.unitPrice());
            item.setTotalPrice(priced.totalPrice());
            item.setFileName(storedFile != null ? storedFile.originalName() : null);
            item.setFileUrl(storedFile != null ? storedFile.publicUrl() : null);
            orderItems.add(item);
            totalAmount += priced.totalPrice();
        }

        order.setItems(orderItems);
        order.setItemCount(orderItems.size());
        order.setTotalAmount(totalAmount);

        return toResponse(printOrderRepository.save(order));
    }

    private OrderResponse toResponse(PrintOrder order) {
        return new OrderResponse(
                order.getPublicId(),
                order.getName(),
                order.getPhone(),
                order.getAddress(),
                defaultFulfillmentMethod(order.getFulfillmentMethod()),
                order.getPaymentMethod(),
                order.getPaymentScreenshotName(),
                order.getPaymentScreenshotUrl(),
                order.getNotes(),
                order.getOrderStatus(),
                order.getTrackingMessage(),
                order.getItemCount(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getTempId(),
                        item.getDisplayName(),
                        item.getFileType(),
                        item.getServiceCode(),
                        item.getServiceTitle(),
                        item.getColorMode(),
                        item.getPaperSize(),
                        item.getOrientation(),
                        item.getPrintSide(),
                        item.getPages(),
                        item.getPrintablePages(),
                        item.getCopies(),
                        item.getPageRange(),
                        item.getBindingType(),
                        item.getLamination(),
                        item.getScaleType(),
                        item.getFinishType(),
                        item.getMaterialType(),
                        item.getCustomSize(),
                        item.getPriorityLevel(),
                        item.getProductVariant(),
                        item.getNotes(),
                        item.getUnitPrice(),
                        item.getTotalPrice(),
                        item.getFileName(),
                        item.getFileUrl()
                )).toList()
        );
    }

    private String normalizeStatus(String value) {
        if (isBlank(value)) {
            throw new IllegalArgumentException("Status is required");
        }

        return switch (value.trim().toLowerCase(Locale.ROOT)) {
            case "submitted", "confirmed", "printing", "ready", "out_for_delivery", "delivered", "cancelled" -> value.trim().toLowerCase(Locale.ROOT);
            default -> throw new IllegalArgumentException("Unsupported order status");
        };
    }

    private String normalizeFulfillmentMethod(String value) {
        if (isBlank(value)) {
            return "delivery";
        }

        return switch (value.trim().toLowerCase(Locale.ROOT)) {
            case "pickup", "delivery" -> value.trim().toLowerCase(Locale.ROOT);
            default -> throw new IllegalArgumentException("Unsupported fulfillment method");
        };
    }

    private String defaultFulfillmentMethod(String value) {
        return isBlank(value) ? "delivery" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String defaultInitialTrackingMessage(String fulfillmentMethod) {
        return switch (fulfillmentMethod) {
            case "pickup" -> "Order received. The print desk will review the files and confirm when your pickup is ready.";
            default -> "Order received. The print desk will review the files and confirm the job shortly.";
        };
    }

    private String defaultTrackingMessage(String status, String providedMessage) {
        if (!isBlank(providedMessage)) {
            return providedMessage.trim();
        }

        return switch (status) {
            case "submitted" -> "Order received. The print desk will review the files and confirm the job shortly.";
            case "confirmed" -> "Files have been reviewed and the order is queued for production.";
            case "printing" -> "Your documents are currently being printed and finished.";
            case "ready" -> "Your order has been packed and is ready for dispatch.";
            case "out_for_delivery" -> "Your order is out for delivery and on the way.";
            case "delivered" -> "Order completed successfully.";
            case "cancelled" -> "This order has been cancelled. Please contact the delivery team if you need help.";
            default -> "";
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String digitsOnly(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}

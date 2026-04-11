package com.narelaprint.backend.controller;

import com.narelaprint.backend.dto.OrdersResponse;
import com.narelaprint.backend.dto.QuoteRequest;
import com.narelaprint.backend.dto.QuoteResponse;
import com.narelaprint.backend.dto.ServiceCatalogResponse;
import com.narelaprint.backend.dto.ServiceCatalogUpdateRequest;
import com.narelaprint.backend.dto.ServiceCatalogItemResponse;
import com.narelaprint.backend.dto.SiteContentResponse;
import com.narelaprint.backend.dto.SiteContentUpdateRequest;
import com.narelaprint.backend.dto.TrackOrderRequest;
import com.narelaprint.backend.dto.UpdateOrderStatusRequest;
import com.narelaprint.backend.service.OrderService;
import com.narelaprint.backend.service.PricingService;
import com.narelaprint.backend.service.ServiceCatalogService;
import com.narelaprint.backend.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PrintStudioController {

    private final PricingService pricingService;
    private final OrderService orderService;
    private final SiteContentService siteContentService;
    private final ServiceCatalogService serviceCatalogService;

    @PostMapping("/quote")
    public QuoteResponse quote(@RequestBody QuoteRequest request) {
        return pricingService.quote(request);
    }

    @GetMapping("/orders")
    public OrdersResponse orders() {
        return new OrdersResponse(orderService.findAll());
    }

    @GetMapping("/site-content")
    public SiteContentResponse siteContent() {
        return siteContentService.getContent();
    }

    @GetMapping("/service-catalog")
    public ServiceCatalogResponse serviceCatalog() {
        return serviceCatalogService.getCatalog();
    }

    @PostMapping("/service-catalog")
    public ResponseEntity<?> updateServiceCatalog(@RequestBody ServiceCatalogUpdateRequest request) {
        try {
            return ResponseEntity.ok(serviceCatalogService.updateCatalog(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping(value = "/service-catalog/{code}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadServiceImage(@PathVariable String code, @RequestParam("image") MultipartFile image) {
        try {
            ServiceCatalogItemResponse response = serviceCatalogService.updateServiceImage(code, image);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to store service image."));
        }
    }

    @DeleteMapping("/service-catalog/{code}/image")
    public ResponseEntity<?> removeServiceImage(@PathVariable String code) {
        try {
            ServiceCatalogItemResponse response = serviceCatalogService.removeServiceImage(code);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/site-content")
    public SiteContentResponse updateSiteContent(@RequestBody SiteContentUpdateRequest request) {
        return siteContentService.updateContent(request);
    }

    @PostMapping("/orders/track")
    public ResponseEntity<?> trackOrder(@RequestBody TrackOrderRequest request) {
        try {
            return ResponseEntity.ok(orderService.trackOrder(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", exception.getMessage()));
        }
    }

    @PatchMapping("/orders/{publicId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String publicId, @RequestBody UpdateOrderStatusRequest request) {
        try {
            return ResponseEntity.ok(orderService.updateStatus(publicId, request));
        } catch (IllegalArgumentException exception) {
            HttpStatus status = "Order not found".equals(exception.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(java.util.Map.of("error", exception.getMessage()));
        }
    }

    @DeleteMapping("/orders/{publicId}")
    public ResponseEntity<?> deleteOrder(@PathVariable String publicId) {
        try {
            orderService.deleteOrder(publicId);
            return ResponseEntity.ok(Map.of("id", publicId));
        } catch (IllegalArgumentException exception) {
            HttpStatus status = "Order not found".equals(exception.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping(value = "/orders", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createOrder(
            @RequestParam String name,
            @RequestParam String phone,
            @RequestParam(required = false, defaultValue = "") String address,
            @RequestParam(required = false, defaultValue = "delivery") String fulfillmentMethod,
            @RequestParam(required = false, defaultValue = "upi_qr") String paymentMethod,
            @RequestParam(required = false, defaultValue = "") String notes,
            @RequestParam String items,
            @RequestParam(required = false) MultipartFile[] files,
            @RequestParam(required = false) MultipartFile paymentScreenshot
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(name, phone, address, fulfillmentMethod, paymentMethod, notes, items, files, paymentScreenshot));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", exception.getMessage()));
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Failed to store uploaded files."));
        }
    }
}

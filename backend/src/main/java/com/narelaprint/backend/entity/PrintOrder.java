package com.narelaprint.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "print_orders")
public class PrintOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String publicId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column
    private String fulfillmentMethod;

    private String paymentMethod;

    private String paymentScreenshotName;

    private String paymentScreenshotUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private String orderStatus;

    @Column(columnDefinition = "TEXT")
    private String trackingMessage;

    private Integer itemCount;

    private Integer totalAmount;

    private Instant createdAt;

    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (orderStatus == null || orderStatus.isBlank()) {
            orderStatus = "submitted";
        }
        if (fulfillmentMethod == null || fulfillmentMethod.isBlank()) {
            fulfillmentMethod = "delivery";
        }
        if (paymentMethod == null || paymentMethod.isBlank()) {
            paymentMethod = "upi_qr";
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        if (fulfillmentMethod == null || fulfillmentMethod.isBlank()) {
            fulfillmentMethod = "delivery";
        }
        if (paymentMethod == null || paymentMethod.isBlank()) {
            paymentMethod = "upi_qr";
        }
    }
}

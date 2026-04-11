package com.narelaprint.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "service_catalog_items")
public class ServiceCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String priceLabel;

    // Nullable for backward-compatible schema updates; normalized to a default in service layer.
    private Integer basePrice;

    @Column(nullable = false)
    private String unitLabel;

    @Column(nullable = false)
    private Boolean featured;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false)
    private Integer sortOrder;
}

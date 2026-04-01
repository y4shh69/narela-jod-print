package com.narelaprint.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private PrintOrder order;

    private String tempId;
    private String displayName;
    private String fileType;
    private String serviceCode;
    private String serviceTitle;
    private String colorMode;
    private String paperSize;
    private String orientation;
    private String printSide;
    private Integer pages;
    private Integer printablePages;
    private Integer copies;
    private String pageRange;
    private String bindingType;
    private Boolean lamination;
    private String scaleType;
    private String finishType;
    private String materialType;
    private String customSize;
    private String priorityLevel;
    private String productVariant;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Integer unitPrice;
    private Integer totalPrice;
    private String fileName;
    private String fileUrl;
}

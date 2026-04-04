package com.narelaprint.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "site_content")
public class SiteContent {

    @Id
    private Long id;

    @Column(nullable = false)
    private String bannerLabel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String dailyOffer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String dailyMessage;

    @Column(nullable = false)
    private String shopStatus;

    @Column(nullable = false)
    private Boolean shopOpen;

    @Column(nullable = false)
    private String turnaroundTime;

    @Column(nullable = false)
    private String primaryMetricLabel;

    @Column(nullable = false)
    private String secondaryMetricLabel;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = 1L;
        }
        if (shopOpen == null) {
            shopOpen = true;
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        if (shopOpen == null) {
            shopOpen = true;
        }
        updatedAt = Instant.now();
    }
}

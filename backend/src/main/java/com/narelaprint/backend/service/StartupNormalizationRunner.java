package com.narelaprint.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Backfills newly-added nullable columns after deploys so old databases
 * don't break when we introduce new admin-managed pricing/settings.
 */
@Component
@RequiredArgsConstructor
public class StartupNormalizationRunner implements ApplicationRunner {

    private final SiteContentService siteContentService;
    private final ServiceCatalogService serviceCatalogService;

    @Override
    public void run(ApplicationArguments args) {
        // Triggers getOrCreate + defaults (deliveryCharge, shopOpen, etc.)
        siteContentService.getContent();
        // Triggers seeding + base price normalization.
        serviceCatalogService.getCatalog();
    }
}


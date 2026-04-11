package com.narelaprint.backend.service;

import com.narelaprint.backend.dto.ServiceCatalogItemResponse;
import com.narelaprint.backend.dto.ServiceCatalogItemUpdateRequest;
import com.narelaprint.backend.dto.ServiceCatalogResponse;
import com.narelaprint.backend.dto.ServiceCatalogUpdateRequest;
import com.narelaprint.backend.entity.ServiceCatalogItem;
import com.narelaprint.backend.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {

    private final ServiceCatalogRepository serviceCatalogRepository;

    public ServiceCatalogResponse getCatalog() {
        ensureSeeded();
        normalizeExistingItems();
        return new ServiceCatalogResponse(serviceCatalogRepository.findAll().stream()
                .sorted(Comparator.comparing(ServiceCatalogItem::getSortOrder).thenComparing(ServiceCatalogItem::getTitle))
                .map(this::toResponse)
                .toList());
    }

    public ServiceCatalogResponse updateCatalog(ServiceCatalogUpdateRequest request) {
        ensureSeeded();
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("At least one service item is required");
        }

        Map<String, ServiceCatalogItem> existingByCode = serviceCatalogRepository.findAll().stream()
                .collect(Collectors.toMap(ServiceCatalogItem::getCode, Function.identity()));

        List<ServiceCatalogItem> updatedItems = new ArrayList<>();
        Set<String> requestedCodes = new HashSet<>();
        for (ServiceCatalogItemUpdateRequest itemRequest : request.items()) {
            if (itemRequest == null || blank(itemRequest.code())) {
                continue;
            }
            String code = itemRequest.code().trim().toLowerCase(Locale.ROOT);
            requestedCodes.add(code);
            ServiceCatalogItem item = existingByCode.getOrDefault(code, new ServiceCatalogItem());
            item.setCode(code);
            item.setTitle(defaultString(itemRequest.title(), titleFromCode(code)));
            item.setCategory(defaultString(itemRequest.category(), "Printing"));
            item.setDescription(defaultString(itemRequest.description(), "Professional print and stationery support."));
            item.setPriceLabel(defaultString(itemRequest.priceLabel(), "From Rs 99"));
            item.setBasePrice(normalizePrice(itemRequest.basePrice(), inferBasePrice(item.getPriceLabel())));
            item.setUnitLabel(defaultString(itemRequest.unitLabel(), "starting price"));
            item.setFeatured(Boolean.TRUE.equals(itemRequest.featured()));
            item.setActive(itemRequest.active() == null || itemRequest.active());
            item.setSortOrder(itemRequest.sortOrder() == null ? 999 : itemRequest.sortOrder());
            updatedItems.add(item);
        }

        List<ServiceCatalogItem> removedItems = existingByCode.values().stream()
                .filter(item -> !requestedCodes.contains(item.getCode()))
                .toList();
        if (!removedItems.isEmpty()) {
            serviceCatalogRepository.deleteAll(removedItems);
        }

        serviceCatalogRepository.saveAll(updatedItems);
        return getCatalog();
    }

    private ServiceCatalogItemResponse toResponse(ServiceCatalogItem item) {
        return new ServiceCatalogItemResponse(
                item.getCode(),
                item.getTitle(),
                item.getCategory(),
                item.getDescription(),
                item.getPriceLabel(),
                normalizePrice(item.getBasePrice(), inferBasePrice(item.getPriceLabel())),
                item.getUnitLabel(),
                item.getFeatured(),
                item.getActive(),
                item.getSortOrder()
        );
    }

    private void ensureSeeded() {
        if (serviceCatalogRepository.count() > 0) {
            return;
        }

        List<ServiceCatalogItem> items = List.of(
                item("business_cards", "Business Cards", "Cards & Identity", "Classic business card printing with premium finish options.", "From Rs 200", 200, "per 100 units", true, 1),
                item("visiting_cards", "Visiting Cards", "Cards & Identity", "Standard visiting card printing for offices, freelancers, and student portfolios.", "From Rs 200", 200, "per 100 units", true, 2),
                item("standard_visiting_cards", "Standard Visiting Cards", "Cards & Identity", "Straight-edge visiting cards for clean professional branding.", "From Rs 200", 200, "per 100 units", false, 3),
                item("classic_visiting_cards", "Classic Visiting Cards", "Cards & Identity", "Premium matte visiting cards with timeless corporate styling.", "From Rs 230", 230, "per 100 units", false, 4),
                item("rounded_corner_visiting_cards", "Rounded Corner Visiting Cards", "Cards & Identity", "Soft-edge visiting cards with a polished modern look.", "From Rs 250", 250, "per 100 units", false, 5),
                item("square_visiting_cards", "Square Visiting Cards", "Cards & Identity", "Square format visiting cards for bold branding.", "From Rs 250", 250, "per 100 units", false, 6),
                item("leaf_visiting_cards", "Leaf Visiting Cards", "Cards & Identity", "Shape-cut leaf cards for boutique brands and event promotions.", "From Rs 270", 270, "per 100 units", false, 7),
                item("oval_visiting_cards", "Oval Visiting Cards", "Cards & Identity", "Oval visiting cards for product tags, branding, and premium packaging.", "From Rs 270", 270, "per 100 units", false, 8),
                item("circle_visiting_cards", "Circle Visiting Cards", "Cards & Identity", "Circular cards for creative packaging and standout brand handouts.", "From Rs 270", 270, "per 100 units", false, 9),
                item("letterheads", "Letterheads", "Letterheads & Stationery", "Clean business letterheads for proposals, invoices, and company communication.", "From Rs 299", 299, "starting price", false, 10),
                item("letterhead_printing", "Letter Head Printing", "Letterheads & Stationery", "Bulk letterhead printing with sharp brand alignment and paper options.", "From Rs 349", 349, "starting price", false, 11),
                item("premium_embellishment_stationery", "Premium Embellishment Stationery", "Letterheads & Stationery", "Luxury stationery with premium finishes for invites and brand kits.", "From Rs 799", 799, "starting price", false, 12),
                item("envelopes", "Envelopes", "Letterheads & Stationery", "Printed envelopes for office dispatch and branded communications.", "From Rs 199", 199, "starting price", false, 13),
                item("bill_books", "Bill Books", "Letterheads & Stationery", "Custom bill books and receipt books for retail, tuition, and office counters.", "From Rs 249", 249, "starting price", false, 14),
                item("document_printing", "Document Printing", "Printing", "Daily document printing for assignments, office files, reports, and forms.", "From Rs 2/page", 2, "per page", true, 15),
                item("legal_document_print", "Legal Document Print", "Printing", "Contract, affidavit, agreement, and legal document printing with clean layout handling.", "From Rs 5/page", 5, "per page", false, 16),
                item("resume_printing", "Resume Printing", "Printing", "Resume and CV printing with premium paper and neat presentation.", "From Rs 29", 29, "starting price", false, 17),
                item("book_printing", "Book Printing", "Printing", "Book and thesis printing for institutions, authors, and training material.", "From Rs 399", 399, "starting price", false, 18),
                item("certificates_printing", "Certificates Printing", "Certificate & Cards", "Certificate printing for schools, coaching centres, and events.", "From Rs 25", 25, "starting price", false, 19),
                item("poster_printing", "Poster Printing", "Printing", "Large-format poster printing for classrooms, shops, and campaigns.", "From Rs 99", 99, "starting price", false, 20),
                item("leaflets_flyers_pamphlets", "Leaflets / Flyers / Pamphlets Printing", "Printing", "Promotional flyers, pamphlets, and leaflet printing in bulk.", "From Rs 2.5/unit", 3, "starting price", false, 21),
                item("notebook_printing", "Notebook Printing", "Stationery", "Notebook cover and custom notebook print jobs for schools and branding.", "From Rs 89", 89, "starting price", false, 22),
                item("brochure_printing", "Brochure Printing", "Printing", "Folded brochures for product handouts, admissions, and catalogs.", "From Rs 8/unit", 8, "starting price", false, 23),
                item("photo_album_printing", "Photo Album Printing", "Printing", "Custom photo albums and memory books with print-ready layouts.", "From Rs 799", 799, "starting price", false, 24),
                item("sticker_printing", "Sticker Printing", "Printing", "Die-cut and standard sticker printing for products, labels, and gifts.", "From Rs 149", 149, "starting price", false, 25),
                item("annual_report_printing", "Annual Report Printing", "Printing", "Corporate annual report printing with clean binding and finishing.", "From Rs 599", 599, "starting price", false, 26),
                item("booklets", "Booklets", "Printing", "Booklet printing for catalogues, events, menus, and institutional use.", "From Rs 149", 149, "starting price", false, 27),
                item("presentation_folders", "Presentation Folders", "Printing", "Folder printing for office presentations, admissions, and brand kits.", "From Rs 35", 35, "starting price", false, 28),
                item("raised_foil_presentation_folders", "Raised Foil Presentation Folders", "Printing", "Premium presentation folders with foil accents and luxury finish.", "From Rs 89", 89, "starting price", false, 29),
                item("rubber_stamp", "Rubber Stamp", "Office Essentials", "Rubber stamp creation for approval, office use, and signatures.", "From Rs 199", 199, "starting price", false, 30),
                item("notebooks", "Notebooks", "Stationery", "Retail and custom notebooks for students, events, and office gifting.", "From Rs 59", 59, "starting price", false, 31),
                item("desk_calendars", "Desk Calendars", "Calendars & Diaries", "Desk calendars for branded giveaways and office desks.", "From Rs 149", 149, "starting price", false, 32),
                item("table_calendar_printing", "Table Calendar Printing", "Calendars & Diaries", "Custom table calendar printing with monthly layout options.", "From Rs 179", 179, "starting price", false, 33),
                item("diaries", "Diaries", "Calendars & Diaries", "Corporate diaries and personalised daily planners.", "From Rs 199", 199, "starting price", false, 34),
                item("id_cards", "ID Cards", "Cards & Identity", "School, office, and event ID cards with holder-ready finishing.", "From Rs 79", 79, "starting price", false, 35),
                item("lanyards", "Lanyards", "Cards & Identity", "Custom lanyards for IDs, events, and organisation branding.", "From Rs 35", 35, "starting price", false, 36),
                item("notepads", "Notepads", "Stationery", "Branded notepads and writing pads for office desks and events.", "From Rs 49", 49, "starting price", false, 37),
                item("cards", "Cards", "Certificate & Cards", "Thank-you cards, event cards, and custom printed greeting cards.", "From Rs 25", 25, "starting price", false, 38),
                item("certificates_and_cards", "Certificate & Cards", "Certificate & Cards", "A combined category for certificate sets and formal printed cards.", "From Rs 49", 49, "starting price", false, 39),
                item("pens", "Pens", "Office Essentials", "Custom printed pens for office supply and promotional gifting.", "From Rs 20", 20, "starting price", false, 40),
                item("combo_sets", "Combo Sets", "Office Essentials", "Corporate combo sets with folders, pen kits, and presentation items.", "From Rs 499", 499, "starting price", false, 41),
                item("personalised_gifts", "Personalised Gifts", "Personalised Gifts", "Custom printed gifts including mugs, branded keepsakes, and curated gift items.", "From Rs 199", 199, "starting price", false, 42),
                item("customised_playing_cards", "Customised Playing Cards", "Personalised Gifts", "Personalised playing cards for gifts, parties, and promotional kits.", "From Rs 299", 299, "starting price", false, 43),
                item("letterhead_and_stationery", "Letterhead & Stationery", "Letterheads & Stationery", "Bundled stationery sets for offices, events, and premium business branding.", "From Rs 699", 699, "starting price", false, 44)
        );

        serviceCatalogRepository.saveAll(items);
    }

    private void normalizeExistingItems() {
        List<ServiceCatalogItem> itemsNeedingUpdate = serviceCatalogRepository.findAll().stream()
                .filter(item -> item.getBasePrice() == null || item.getBasePrice() < 1)
                .peek(item -> item.setBasePrice(inferBasePrice(item.getPriceLabel())))
                .toList();

        if (!itemsNeedingUpdate.isEmpty()) {
            serviceCatalogRepository.saveAll(itemsNeedingUpdate);
        }
    }

    private ServiceCatalogItem item(String code, String title, String category, String description, String priceLabel, int basePrice, String unitLabel, boolean featured, int sortOrder) {
        ServiceCatalogItem item = new ServiceCatalogItem();
        item.setCode(code);
        item.setTitle(title);
        item.setCategory(category);
        item.setDescription(description);
        item.setPriceLabel(priceLabel);
        item.setBasePrice(basePrice);
        item.setUnitLabel(unitLabel);
        item.setFeatured(featured);
        item.setActive(true);
        item.setSortOrder(sortOrder);
        return item;
    }

    private int normalizePrice(Integer value, int fallback) {
        if (value == null || value < 1) {
            return Math.max(fallback, 1);
        }
        return value;
    }

    private int inferBasePrice(String priceLabel) {
        if (blank(priceLabel)) {
            return 99;
        }

        String digits = priceLabel.replaceAll("[^0-9]", "");
        if (digits.isBlank()) {
            return 99;
        }

        try {
            return Math.max(Integer.parseInt(digits), 1);
        } catch (NumberFormatException ex) {
            return 99;
        }
    }

    private String defaultString(String value, String fallback) {
        return blank(value) ? fallback : value.trim();
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private String titleFromCode(String code) {
        String[] parts = code.split("_");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) continue;
            if (!builder.isEmpty()) builder.append(' ');
            builder.append(part.substring(0, 1).toUpperCase(Locale.ROOT)).append(part.substring(1));
        }
        return builder.toString();
    }
}

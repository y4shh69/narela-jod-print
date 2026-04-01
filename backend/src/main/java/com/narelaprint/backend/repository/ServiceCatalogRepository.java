package com.narelaprint.backend.repository;

import com.narelaprint.backend.entity.ServiceCatalogItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalogItem, Long> {
    Optional<ServiceCatalogItem> findByCode(String code);
}

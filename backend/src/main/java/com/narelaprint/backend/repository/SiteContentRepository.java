package com.narelaprint.backend.repository;

import com.narelaprint.backend.entity.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteContentRepository extends JpaRepository<SiteContent, Long> {
}

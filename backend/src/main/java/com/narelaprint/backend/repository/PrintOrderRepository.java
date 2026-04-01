package com.narelaprint.backend.repository;

import com.narelaprint.backend.entity.PrintOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrintOrderRepository extends JpaRepository<PrintOrder, Long> {
    Optional<PrintOrder> findByPublicId(String publicId);
}

package com.foodorder.backend.repository;

import com.foodorder.backend.model.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrue();

    @Query(value = "SELECT * FROM restaurants WHERE is_active = true " +
           "AND (:search IS NULL OR :search = '' OR CAST(name AS text) ILIKE CONCAT('%', :search, '%')) " +
           "AND (:category IS NULL OR :category = '' OR " +
           "     (:category = 'Veg' AND CAST(description AS text) ILIKE '%veg%' AND CAST(description AS text) NOT ILIKE '%non-veg%') OR " +
           "     (:category = 'Non-Veg' AND (CAST(description AS text) ILIKE '%non-veg%' OR CAST(description AS text) ILIKE '%chicken%' OR CAST(description AS text) ILIKE '%meat%' OR CAST(description AS text) ILIKE '%chaap%')) OR " +
           "     (:category = 'Fast Food' AND (CAST(description AS text) ILIKE '%fast%' OR CAST(description AS text) ILIKE '%burger%' OR CAST(description AS text) ILIKE '%pizza%')))",
           countQuery = "SELECT count(*) FROM restaurants WHERE is_active = true " +
           "AND (:search IS NULL OR :search = '' OR CAST(name AS text) ILIKE CONCAT('%', :search, '%')) " +
           "AND (:category IS NULL OR :category = '' OR " +
           "     (:category = 'Veg' AND CAST(description AS text) ILIKE '%veg%' AND CAST(description AS text) NOT ILIKE '%non-veg%') OR " +
           "     (:category = 'Non-Veg' AND (CAST(description AS text) ILIKE '%non-veg%' OR CAST(description AS text) ILIKE '%chicken%' OR CAST(description AS text) ILIKE '%meat%' OR CAST(description AS text) ILIKE '%chaap%')) OR " +
           "     (:category = 'Fast Food' AND (CAST(description AS text) ILIKE '%fast%' OR CAST(description AS text) ILIKE '%burger%' OR CAST(description AS text) ILIKE '%pizza%')))",
           nativeQuery = true)
    Page<Restaurant> findActiveFiltered(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable
    );
}

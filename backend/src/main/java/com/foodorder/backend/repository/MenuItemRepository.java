package com.foodorder.backend.repository;

import com.foodorder.backend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsVeg(Long restaurantId, Boolean isVeg);
    List<MenuItem> findByCategoryIgnoreCase(String category);

    @Transactional
    void deleteAllByRestaurantId(Long restaurantId);
}

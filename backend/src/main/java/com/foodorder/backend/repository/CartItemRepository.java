package com.foodorder.backend.repository;

import com.foodorder.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.menuItem.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.menuItem.id = :menuItemId")
    void deleteByMenuItemId(@Param("menuItemId") Long menuItemId);
}

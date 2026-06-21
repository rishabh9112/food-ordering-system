package com.foodorder.backend.repository;

import com.foodorder.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi WHERE oi.menuItem.restaurant.id = :restaurantId")
    List<Order> findOrdersByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi WHERE oi.menuItem.id = :menuItemId")
    List<Order> findOrdersByMenuItemId(@Param("menuItemId") Long menuItemId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal calculateTotalRevenue();

    @Query("""
        SELECT oi.menuItem.name, SUM(oi.quantity) as totalQty, oi.menuItem.restaurant.name
        FROM OrderItem oi
        GROUP BY oi.menuItem.name, oi.menuItem.restaurant.name
        ORDER BY totalQty DESC
        LIMIT 5
        """)
    List<Object[]> findTopOrderedItems();
}

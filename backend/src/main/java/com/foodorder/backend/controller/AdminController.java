package com.foodorder.backend.controller;

import com.foodorder.backend.model.MenuItem;
import com.foodorder.backend.model.Order;
import com.foodorder.backend.model.OrderStatus;
import com.foodorder.backend.model.Restaurant;
import com.foodorder.backend.service.MenuItemService;
import com.foodorder.backend.service.OrderService;
import com.foodorder.backend.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;
    private final OrderService orderService;

    // ── Restaurant Management ──────────────────────────────────

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @PostMapping("/restaurants")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.create(restaurant));
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id,
                                                        @RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.update(id, restaurant));
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Menu Management ───────────────────────────────────────

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<List<MenuItem>> getAllMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuItemService.getAllMenuByRestaurant(restaurantId));
    }

    @PostMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<MenuItem> createMenuItem(@PathVariable Long restaurantId,
                                                    @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuItemService.create(restaurantId, menuItem));
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id,
                                                    @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuItemService.update(id, menuItem));
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Order Management ─────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                    @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}

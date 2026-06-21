package com.foodorder.backend.service;

import com.foodorder.backend.repository.CartItemRepository;
import com.foodorder.backend.repository.OrderRepository;
import com.foodorder.backend.model.Restaurant;
import com.foodorder.backend.repository.MenuItemRepository;
import com.foodorder.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    public Page<Restaurant> getAllActiveRestaurants(String search, String category, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanCategory = (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category.trim())) ? category.trim() : null;
        return restaurantRepository.findActiveFiltered(cleanSearch, cleanCategory, pageable);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));
    }

    public Restaurant create(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant update(Long id, Restaurant data) {
        Restaurant existing = getById(id);
        existing.setName(data.getName());
        existing.setDescription(data.getDescription());
        existing.setLocation(data.getLocation());
        existing.setImageUrl(data.getImageUrl());
        existing.setIsActive(data.getIsActive());
        return restaurantRepository.save(existing);
    }

    /**
     * Deletes a restaurant and ALL its associated menu items.
     * Cart items and Order items must be removed first to avoid FK constraint violations.
     */
    @Transactional
    public void delete(Long id) {
        // Ensure restaurant exists before attempting delete
        restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));
        // 1. Delete all cart items referencing any menu items of this restaurant first
        cartItemRepository.deleteByRestaurantId(id);
        // 2. Delete all orders referencing any menu items of this restaurant
        List<com.foodorder.backend.model.Order> orders = orderRepository.findOrdersByRestaurantId(id);
        if (!orders.isEmpty()) {
            orderRepository.deleteAll(orders);
        }
        // 3. Delete all menu items belonging to this restaurant
        menuItemRepository.deleteAllByRestaurantId(id);
        // 4. Now safe to delete the restaurant
        restaurantRepository.deleteById(id);
    }
}

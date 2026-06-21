package com.foodorder.backend.service;

import com.foodorder.backend.repository.CartItemRepository;
import com.foodorder.backend.repository.OrderRepository;
import com.foodorder.backend.model.MenuItem;
import com.foodorder.backend.model.Restaurant;
import com.foodorder.backend.repository.MenuItemRepository;
import com.foodorder.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
    }

    public List<MenuItem> getAllMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    public MenuItem getById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
    }

    public MenuItem create(Long restaurantId, MenuItem item) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + restaurantId));
        item.setRestaurant(restaurant);
        return menuItemRepository.save(item);
    }

    public MenuItem update(Long id, MenuItem data) {
        MenuItem existing = getById(id);
        existing.setName(data.getName());
        existing.setDescription(data.getDescription());
        existing.setPrice(data.getPrice());
        existing.setCategory(data.getCategory());
        existing.setIsVeg(data.getIsVeg());
        existing.setIsAvailable(data.getIsAvailable());
        return menuItemRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
        // 1. Delete all cart items referencing this menu item
        cartItemRepository.deleteByMenuItemId(id);
        // 2. Delete all orders referencing this menu item
        List<com.foodorder.backend.model.Order> orders = orderRepository.findOrdersByMenuItemId(id);
        if (!orders.isEmpty()) {
            orderRepository.deleteAll(orders);
        }
        // 3. Now safe to delete the menu item
        menuItemRepository.deleteById(id);
    }
}

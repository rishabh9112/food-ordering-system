package com.foodorder.backend.service;

import com.foodorder.backend.dto.AddToCartRequest;
import com.foodorder.backend.dto.UpdateCartRequest;
import com.foodorder.backend.model.*;
import com.foodorder.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    public Cart getCartByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    @Transactional
    public Cart addItem(String email, AddToCartRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Check if item already exists
        cart.getItems().stream()
                .filter(ci -> ci.getMenuItem().getId().equals(request.getMenuItemId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + request.getQuantity()),
                        () -> {
                            CartItem newItem = new CartItem();
                            newItem.setCart(cart);
                            newItem.setMenuItem(menuItem);
                            newItem.setQuantity(request.getQuantity());
                            newItem.setUnitPrice(menuItem.getPrice());
                            cart.getItems().add(newItem);
                        }
                );

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItem(String email, Long itemId, UpdateCartRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(request.getQuantity());
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(ci -> ci.getId().equals(itemId));
        return cartRepository.save(cart);
    }
}

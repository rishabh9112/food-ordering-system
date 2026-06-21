package com.foodorder.backend.controller;

import com.foodorder.backend.dto.AddToCartRequest;
import com.foodorder.backend.dto.UpdateCartRequest;
import com.foodorder.backend.model.Cart;
import com.foodorder.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCartByEmail(auth.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItem(Authentication auth,
                                        @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItem(auth.getName(), request));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<Cart> updateItem(Authentication auth,
                                           @PathVariable Long itemId,
                                           @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(cartService.updateItem(auth.getName(), itemId, request));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Cart> removeItem(Authentication auth,
                                           @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(auth.getName(), itemId));
    }
}

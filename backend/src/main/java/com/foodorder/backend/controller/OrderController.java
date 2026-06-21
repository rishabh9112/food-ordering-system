package com.foodorder.backend.controller;

import com.foodorder.backend.model.Order;
import com.foodorder.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(Authentication auth) {
        return ResponseEntity.ok(orderService.placeOrder(auth.getName()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrderHistory(auth.getName()));
    }
}

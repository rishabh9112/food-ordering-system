package com.foodorder.backend.controller;

import com.foodorder.backend.model.MenuItem;
import com.foodorder.backend.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<List<MenuItem>> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuItemService.getMenuByRestaurant(restaurantId));
    }

    @GetMapping("/menu/{id}")
    public ResponseEntity<MenuItem> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getById(id));
    }
}

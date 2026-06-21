package com.foodorder.backend.controller;

import com.foodorder.backend.model.Restaurant;
import com.foodorder.backend.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Restaurant>> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants(
                search,
                category,
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").ascending())
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }
}

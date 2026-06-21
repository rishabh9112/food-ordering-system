package com.foodorder.backend.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long menuItemId;
    private Integer quantity;
}

package com.foodorder.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String address;
    // email and role are intentionally absent — they cannot be updated via this endpoint
}

package com.foodorder.backend.controller;

import com.foodorder.backend.dto.ProfileResponse;
import com.foodorder.backend.dto.UpdateProfileRequest;
import com.foodorder.backend.model.User;
import com.foodorder.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /** GET /api/users/profile — returns current user's profile (no password) */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toResponse(user));
    }

    /** PUT /api/users/profile — updates name and address only; email/role cannot be changed */
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(Authentication auth,
                                                          @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        // address may be null/empty (user wants to clear it)
        user.setAddress(request.getAddress());

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private ProfileResponse toResponse(User u) {
        return new ProfileResponse(u.getId(), u.getName(), u.getEmail(), u.getAddress(),
                u.getRole().name());
    }
}

package com.foodorder.backend.service;

import com.foodorder.backend.dto.AuthResponse;
import com.foodorder.backend.dto.LoginRequest;
import com.foodorder.backend.dto.RegisterRequest;
import com.foodorder.backend.model.Cart;
import com.foodorder.backend.model.Role;
import com.foodorder.backend.model.User;
import com.foodorder.backend.repository.CartRepository;
import com.foodorder.backend.repository.UserRepository;
import com.foodorder.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER); // Always CUSTOMER — role field in request is ignored
        user.setAddress(request.getAddress());

        user = userRepository.save(user);

        // Create empty cart for CUSTOMER
        if (user.getRole() == Role.CUSTOMER) {
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getName());
    }
}

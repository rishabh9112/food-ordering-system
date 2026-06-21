package com.foodorder.backend.controller;

import com.foodorder.backend.model.Order;
import com.foodorder.backend.service.OrderService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> payload) {
        if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
            ));
        }
        try {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            Order order = orderService.getOrderById(orderId);

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Amount in paise (1 INR = 100 paise)
            int amount = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + orderId);
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Persist Razorpay order ID to our DB
            orderService.setRazorpayOrderId(orderId, razorpayOrder.get("id"));

            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", amount);
            response.put("currency", "INR");
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Razorpay create-order failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-signature")
    public ResponseEntity<?> verifySignature(@RequestBody Map<String, String> payload) {
        try {
            String razorpayOrderId   = payload.get("razorpayOrderId");
            String razorpayPaymentId = payload.get("razorpayPaymentId");
            String razorpaySignature = payload.get("razorpaySignature");
            Long   orderId           = Long.valueOf(payload.get("orderId"));

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id",   razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature",  razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                orderService.confirmOrderPayment(orderId, razorpayPaymentId);
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Payment verified successfully",
                    "orderId", orderId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Invalid payment signature"
                ));
            }
        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}

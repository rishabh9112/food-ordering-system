package com.foodorder.backend.service;

import com.foodorder.backend.model.Order;
import com.foodorder.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;

    public Map<String, Object> getDashboardStats() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        List<Object[]> topItems = orderRepository.findTopOrderedItems();

        List<Map<String, Object>> topItemsList = new ArrayList<>();
        int limit = Math.min(topItems.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] row = topItems.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", row[0]);
            item.put("totalQuantity", row[1]);
            item.put("restaurantName", row.length > 2 ? row[2] : "");
            topItemsList.add(item);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("topItems", topItemsList);

        return stats;
    }
}

package com.littlebloom.controller;

import com.littlebloom.dto.DashboardDataDTO;
import com.littlebloom.dto.DashboardDataDTO.ChartDataDTO;
import com.littlebloom.dto.DashboardDataDTO.SummaryDTO;
import com.littlebloom.model.OrderItem;
import com.littlebloom.model.User;
import com.littlebloom.repository.OrderItemRepository;
import com.littlebloom.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

// @RestController - DISABLED: Using UnifiedAnalyticsController instead
// @RequestMapping("/api/analytics")
@Slf4j
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/analytics/dashboard?sellerId={id}&year={year}&period={daily|weekly|monthly|yearly}
     * DISABLED - Use UnifiedAnalyticsController instead
     */
    // @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard_DISABLED(
            @RequestParam Long sellerId,
            @RequestParam(defaultValue = "2024") int year,
            @RequestParam(defaultValue = "monthly") String period) {
        try {
            log.info("Dashboard request: sellerId={}, year={}, period={}", sellerId, year, period);

            User seller = userRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            List<OrderItem> allItems = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller);
            List<OrderItem> yearItems = allItems.stream()
                    .filter(item -> item.getCreatedAt().getYear() == year)
                    .collect(Collectors.toList());

            BigDecimal totalRevenue = yearItems.stream()
                    .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long totalOrders = yearItems.stream()
                    .map(item -> item.getOrder().getId())
                    .distinct()
                    .count();

            double avgOrderValue = totalOrders > 0 ? 
                    totalRevenue.doubleValue() / totalOrders : 0;

            List<ChartDataDTO> chartData = getChartDataByPeriod(yearItems, period, year);

            DashboardDataDTO response = DashboardDataDTO.builder()
                    .summary(SummaryDTO.builder()
                            .totalOrders(totalOrders)
                            .totalRevenue(Math.round(totalRevenue.doubleValue() * 100.0) / 100.0)
                            .averageOrderValue(Math.round(avgOrderValue * 100.0) / 100.0)
                            .period(period)
                            .year(year)
                            .build())
                    .chartData(chartData)
                    .tableData(chartData)
                    .build();

            log.info("Dashboard response: {} orders, {} revenue", totalOrders, totalRevenue);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching dashboard data", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private List<ChartDataDTO> getChartDataByPeriod(List<OrderItem> items, String period, int year) {
        switch (period.toLowerCase()) {
            case "daily":
                return getDailyData(items, year);
            case "weekly":
                return getWeeklyData(items, year);
            case "yearly":
                return getYearlyData(items);
            default:
                return getMonthlyData(items, year);
        }
    }

    private List<ChartDataDTO> getDailyData(List<OrderItem> items, int year) {
        LocalDate now = LocalDate.now();
        LocalDate firstDay = now.withDayOfMonth(1);
        LocalDate lastDay = now.withDayOfMonth(now.lengthOfMonth());

        Map<Integer, ChartDataDTO> dailyMap = new TreeMap<>();
        for (int day = 1; day <= lastDay.getDayOfMonth(); day++) {
            dailyMap.put(day, ChartDataDTO.builder()
                    .label("Day " + day)
                    .orders(0)
                    .revenue(0.0)
                    .build());
        }

        items.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getMonthValue() == now.getMonthValue() && itemDate.getYear() == year) {
                int day = itemDate.getDayOfMonth();
                ChartDataDTO data = dailyMap.get(day);
                if (data != null) {
                    data.setOrders(data.getOrders() + 1);
                    data.setRevenue(data.getRevenue() + item.getPrice().doubleValue() * item.getQuantity());
                }
            }
        });

        return new ArrayList<>(dailyMap.values());
    }

    private List<ChartDataDTO> getWeeklyData(List<OrderItem> items, int year) {
        Map<Integer, ChartDataDTO> weeklyMap = new TreeMap<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        items.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getYear() == year) {
                int week = itemDate.get(weekFields.weekOfYear());
                weeklyMap.putIfAbsent(week, ChartDataDTO.builder()
                        .label("Week " + week)
                        .orders(0)
                        .revenue(0.0)
                        .build());

                ChartDataDTO data = weeklyMap.get(week);
                data.setOrders(data.getOrders() + 1);
                data.setRevenue(data.getRevenue() + item.getPrice().doubleValue() * item.getQuantity());
            }
        });

        return new ArrayList<>(weeklyMap.values());
    }

    private List<ChartDataDTO> getMonthlyData(List<OrderItem> items, int year) {
        String[] months = {"January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"};
        Map<Integer, ChartDataDTO> monthlyMap = new TreeMap<>();

        for (int month = 1; month <= 12; month++) {
            monthlyMap.put(month, ChartDataDTO.builder()
                    .label(months[month - 1])
                    .orders(0)
                    .revenue(0.0)
                    .build());
        }

        items.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getYear() == year) {
                int month = itemDate.getMonthValue();
                ChartDataDTO data = monthlyMap.get(month);
                if (data != null) {
                    data.setOrders(data.getOrders() + 1);
                    data.setRevenue(data.getRevenue() + item.getPrice().doubleValue() * item.getQuantity());
                }
            }
        });

        return new ArrayList<>(monthlyMap.values());
    }

    private List<ChartDataDTO> getYearlyData(List<OrderItem> items) {
        int currentYear = LocalDate.now().getYear();
        Map<Integer, ChartDataDTO> yearlyMap = new TreeMap<>();

        for (int y = currentYear - 4; y <= currentYear; y++) {
            yearlyMap.put(y, ChartDataDTO.builder()
                    .label(String.valueOf(y))
                    .orders(0)
                    .revenue(0.0)
                    .build());
        }

        items.forEach(item -> {
            int itemYear = item.getCreatedAt().getYear();
            if (yearlyMap.containsKey(itemYear)) {
                ChartDataDTO data = yearlyMap.get(itemYear);
                data.setOrders(data.getOrders() + 1);
                data.setRevenue(data.getRevenue() + item.getPrice().doubleValue() * item.getQuantity());
            }
        });

        return new ArrayList<>(yearlyMap.values());
    }
}

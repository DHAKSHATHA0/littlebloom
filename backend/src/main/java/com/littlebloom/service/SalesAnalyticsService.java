package com.littlebloom.service;

import com.littlebloom.model.Order;
import com.littlebloom.model.OrderItem;
import com.littlebloom.model.User;
import com.littlebloom.repository.OrderItemRepository;
import com.littlebloom.repository.OrderRepository;
import com.littlebloom.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SalesAnalyticsService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get analytics dashboard with period-based data
     * Supports: daily, weekly, monthly, yearly
     */
    public DashboardDataDTO getDashboardData(Long sellerId, String period, int year) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<OrderItem> allOrders = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller);

        // Filter orders by year
        List<OrderItem> yearOrders = allOrders.stream()
                .filter(item -> item.getCreatedAt().getYear() == year)
                .collect(Collectors.toList());

        // Calculate summary
        BigDecimal totalRevenue = yearOrders.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = yearOrders.stream()
                .map(item -> item.getOrder().getId())
                .distinct()
                .count();

        double avgOrderValue = totalOrders > 0 ? 
                totalRevenue.doubleValue() / totalOrders : 0;

        // Get period-based chart data
        List<ChartDataDTO> chartData = getChartDataByPeriod(yearOrders, period, year);

        // Build response
        DashboardDataDTO dashboard = DashboardDataDTO.builder()
                .summary(SummaryDTO.builder()
                        .totalOrders(totalOrders)
                        .totalRevenue(totalRevenue.doubleValue())
                        .averageOrderValue(Math.round(avgOrderValue * 100.0) / 100.0)
                        .period(period)
                        .year(year)
                        .build())
                .chartData(chartData)
                .tableData(chartData)  // Same data for table
                .build();

        return dashboard;
    }

    /**
     * Get chart data based on period
     */
    private List<ChartDataDTO> getChartDataByPeriod(List<OrderItem> orders, 
                                                     String period, int year) {
        switch (period.toLowerCase()) {
            case "daily":
                return getDailyChartData(orders, year);
            case "weekly":
                return getWeeklyChartData(orders, year);
            case "monthly":
                return getMonthlyChartData(orders, year);
            case "yearly":
                return getYearlyChartData(orders);
            default:
                return getMonthlyChartData(orders, year);
        }
    }

    /**
     * Daily breakdown for current month
     */
    private List<ChartDataDTO> getDailyChartData(List<OrderItem> orders, int year) {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        LocalDate lastDayOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        Map<Integer, ChartDataDTO> dailyMap = new TreeMap<>();

        for (int day = 1; day <= lastDayOfMonth.getDayOfMonth(); day++) {
            dailyMap.put(day, ChartDataDTO.builder()
                    .label("Day " + day)
                    .orders(0L)
                    .revenue(0.0)
                    .build());
        }

        orders.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getMonthValue() == now.getMonthValue() && 
                itemDate.getYear() == year) {
                int day = itemDate.getDayOfMonth();
                ChartDataDTO data = dailyMap.get(day);
                if (data != null) {
                    data.orders++;
                    data.revenue += item.getPrice().doubleValue() * item.getQuantity();
                }
            }
        });

        return new ArrayList<>(dailyMap.values());
    }

    /**
     * Weekly breakdown
     */
    private List<ChartDataDTO> getWeeklyChartData(List<OrderItem> orders, int year) {
        Map<Integer, ChartDataDTO> weeklyMap = new TreeMap<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        orders.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getYear() == year) {
                int week = itemDate.get(weekFields.weekOfYear());
                String label = "Week " + week;

                weeklyMap.putIfAbsent(week, ChartDataDTO.builder()
                        .label(label)
                        .orders(0L)
                        .revenue(0.0)
                        .build());

                ChartDataDTO data = weeklyMap.get(week);
                data.orders++;
                data.revenue += item.getPrice().doubleValue() * item.getQuantity();
            }
        });

        return new ArrayList<>(weeklyMap.values());
    }

    /**
     * Monthly breakdown
     */
    private List<ChartDataDTO> getMonthlyChartData(List<OrderItem> orders, int year) {
        Map<Integer, ChartDataDTO> monthlyMap = new TreeMap<>();
        String[] months = {"January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"};

        // Initialize all months
        for (int month = 1; month <= 12; month++) {
            monthlyMap.put(month, ChartDataDTO.builder()
                    .label(months[month - 1])
                    .orders(0L)
                    .revenue(0.0)
                    .build());
        }

        // Aggregate orders by month
        orders.forEach(item -> {
            LocalDate itemDate = item.getCreatedAt().toLocalDate();
            if (itemDate.getYear() == year) {
                int month = itemDate.getMonthValue();
                ChartDataDTO data = monthlyMap.get(month);
                if (data != null) {
                    data.orders++;
                    data.revenue += item.getPrice().doubleValue() * item.getQuantity();
                }
            }
        });

        return new ArrayList<>(monthlyMap.values());
    }

    /**
     * Yearly breakdown (last 5 years)
     */
    private List<ChartDataDTO> getYearlyChartData(List<OrderItem> orders) {
        int currentYear = LocalDate.now().getYear();
        Map<Integer, ChartDataDTO> yearlyMap = new TreeMap<>();

        for (int y = currentYear - 4; y <= currentYear; y++) {
            yearlyMap.put(y, ChartDataDTO.builder()
                    .label(String.valueOf(y))
                    .orders(0L)
                    .revenue(0.0)
                    .build());
        }

        orders.forEach(item -> {
            int itemYear = item.getCreatedAt().getYear();
            if (yearlyMap.containsKey(itemYear)) {
                ChartDataDTO data = yearlyMap.get(itemYear);
                data.orders++;
                data.revenue += item.getPrice().doubleValue() * item.getQuantity();
            }
        });

        return new ArrayList<>(yearlyMap.values());
    }

    /**
     * Get sales data for the last 30 days
     */
    public SalesPeriodDTO getSalesLast30Days(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<OrderItem> orderItems = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .filter(item -> item.getCreatedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        return calculateSalesPeriod(orderItems, "Last 30 Days");
    }

    /**
     * Get sales data for the current week
     */
    public SalesPeriodDTO getSalesThisWeek(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        LocalDateTime weekAgo = LocalDateTime.now().minusWeeks(1);
        List<OrderItem> orderItems = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .filter(item -> item.getCreatedAt().isAfter(weekAgo))
                .collect(Collectors.toList());

        return calculateSalesPeriod(orderItems, "This Week");
    }

    /**
     * Get sales data for the current month
     */
    public SalesPeriodDTO getSalesThisMonth(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        LocalDateTime monthAgo = LocalDateTime.now().minusMonths(1);
        List<OrderItem> orderItems = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .filter(item -> item.getCreatedAt().isAfter(monthAgo))
                .collect(Collectors.toList());

        return calculateSalesPeriod(orderItems, "This Month");
    }

    /**
     * Helper method to calculate sales period statistics
     */
    private SalesPeriodDTO calculateSalesPeriod(List<OrderItem> orderItems, String period) {
        BigDecimal totalRevenue = orderItems.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orderItems.stream()
                .map(item -> item.getOrder().getId())
                .distinct()
                .count();

        long totalItems = orderItems.stream()
                .mapToLong(OrderItem::getQuantity)
                .sum();

        double avgOrderValue = totalOrders > 0 ? totalRevenue.doubleValue() / totalOrders : 0;

        return SalesPeriodDTO.builder()
                .period(period)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalItems(totalItems)
                .averageOrderValue(avgOrderValue)
                .build();
    }

    // ======================== DATA CLASSES ========================

    @Data
    @Builder
    public static class DashboardDataDTO {
        private SummaryDTO summary;
        private List<ChartDataDTO> chartData;
        private List<ChartDataDTO> tableData;
    }

    @Data
    @Builder
    public static class SummaryDTO {
        private Long totalOrders;
        private Double totalRevenue;
        private Double averageOrderValue;
        private String period;
        private Integer year;
    }

    @Data
    @Builder
    public static class ChartDataDTO {
        private String label;
        private Long orders;
        private Double revenue;
    }

    @Data
    @Builder
    public static class SalesPeriodDTO {
        private String period;
        private BigDecimal totalRevenue;
        private Long totalOrders;
        private Long totalItems;
        private Double averageOrderValue;
    }

    @Data
    @Builder
    public static class DailySalesDTO {
        private String date;
        private long sales;
        private double revenue;
        private long orders;
    }

    @Data
    @Builder
    public static class SalesPredictionDTO {
        private Double predictedRevenue;
        private Long predictedOrders;
        private Double confidence;
        private String trend;
        private Double slope;
        private Double intercept;
        private Double rSquared;
    }

    @Data
    @Builder
    public static class TrendAnalysisDTO {
        private String date;
        private Double actualRevenue;
        private Double movingAverage;
        private Double volatility;
    }

    @Data
    @Builder
    public static class LinearRegressionResult {
        private Double slope;
        private Double intercept;
        private Double predictedValue;
        private Double rSquared;
    }

    @Data
    @Builder
    public static class SellerDashboardDTO {
        private SalesPeriodDTO last30Days;
        private SalesPeriodDTO thisMonth;
        private SalesPredictionDTO prediction;
        private List<DailySalesDTO> weeklyChart;
        private List<DailySalesDTO> monthlyChart;
        private List<TrendAnalysisDTO> trendAnalysis;
    }
}

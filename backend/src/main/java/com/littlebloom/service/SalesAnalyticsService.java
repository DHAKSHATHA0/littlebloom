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
import java.time.temporal.ChronoUnit;
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
     * Get daily sales breakdown for chart - Current week only (Sunday to Saturday)
     */
    public List<DailySalesDTO> getDailySalesChart(Long sellerId, int days) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Get current week's start (Sunday) and end (Saturday)
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.SUNDAY);
        // If today is Sunday, we want this week. If not, we want the week that includes today
        if (today.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
            // Find the most recent Sunday
            startOfWeek = today.minusDays(today.getDayOfWeek().getValue() % 7);
        }
        LocalDate endOfWeek = startOfWeek.plusDays(6); // Saturday
        
        LocalDateTime startDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endDateTime = endOfWeek.atTime(23, 59, 59);

        // Filter orders for current week only
        List<OrderItem> orderItems = orderItemRepository.findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .filter(item -> {
                    LocalDateTime itemDate = item.getCreatedAt();
                    return !itemDate.isBefore(startDateTime) && !itemDate.isAfter(endDateTime);
                })
                .collect(Collectors.toList());

        // Group by day of week (Sunday to Saturday)
        Map<String, List<OrderItem>> groupedByDayOfWeek = orderItems.stream()
                .collect(Collectors.groupingBy(item -> {
                    java.time.DayOfWeek dayOfWeek = item.getCreatedAt().getDayOfWeek();
                    // Convert to Sunday=0, Monday=1, ..., Saturday=6 format
                    int dayValue = dayOfWeek.getValue() % 7; // Sunday becomes 0
                    String[] dayNames = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                    return dayNames[dayValue];
                }));

        // Create daily sales data in Sunday to Saturday order
        List<String> weekDays = Arrays.asList("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
        List<DailySalesDTO> dailySales = new ArrayList<>();
        
        for (String dayName : weekDays) {
            List<OrderItem> dayItems = groupedByDayOfWeek.getOrDefault(dayName, new ArrayList<>());
            
            BigDecimal revenue = dayItems.stream()
                    .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            dailySales.add(DailySalesDTO.builder()
                    .date(dayName.substring(0, 3)) // Sun, Mon, Tue, etc.
                    .sales(dayItems.size())
                    .revenue(Math.round(revenue.doubleValue() * 100.0) / 100.0) // Round to 2 decimal places
                    .orders(dayItems.stream().map(item -> item.getOrder().getId()).distinct().count())
                    .build());
        }

        return dailySales;
    }

    /**
     * DATA SCIENCE: Simple Linear Regression for next month prediction
     */
    public SalesPredictionDTO predictNextMonthSales(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Get last 30 days of daily sales
        List<DailySalesDTO> dailySales = getDailySalesChart(sellerId, 30);

        // Extract revenue values
        List<Double> revenues = dailySales.stream()
                .map(DailySalesDTO::getRevenue)
                .collect(Collectors.toList());

        // Extract sales count
        List<Long> salesCounts = dailySales.stream()
                .map(DailySalesDTO::getSales)
                .collect(Collectors.toList());

        if (revenues.isEmpty()) {
            return SalesPredictionDTO.builder()
                    .predictedRevenue(0.0)
                    .predictedOrders(0L)
                    .confidence(0.0)
                    .trend("No data")
                    .build();
        }

        // Linear Regression for Revenue
        LinearRegressionResult revenueRegression = performLinearRegression(revenues);
        
        // Linear Regression for Orders
        LinearRegressionResult ordersRegression = performLinearRegression(
                salesCounts.stream().mapToDouble(Long::doubleValue).boxed().collect(Collectors.toList())
        );

        // Calculate trend
        double revenueChange = revenueRegression.slope;
        String trend = revenueChange > 100 ? "📈 Strong Growth" :
                       revenueChange > 0 ? "📈 Slight Growth" :
                       revenueChange > -100 ? "📉 Slight Decline" : "📉 Strong Decline";

        // Calculate confidence based on R-squared
        double confidence = revenueRegression.rSquared * 100;

        return SalesPredictionDTO.builder()
                .predictedRevenue(Math.max(0, revenueRegression.predictedValue))
                .predictedOrders(Math.max(0L, Math.round(ordersRegression.predictedValue)))
                .confidence(confidence)
                .trend(trend)
                .slope(revenueRegression.slope)
                .intercept(revenueRegression.intercept)
                .rSquared(revenueRegression.rSquared)
                .build();
    }

    /**
     * DATA SCIENCE: Moving Average for trend analysis
     */
    public List<TrendAnalysisDTO> getTrendAnalysis(Long sellerId, int windowSize) {
        List<DailySalesDTO> dailySales = getDailySalesChart(sellerId, 30);
        List<TrendAnalysisDTO> trendAnalysis = new ArrayList<>();

        for (int i = 0; i < dailySales.size(); i++) {
            int start = Math.max(0, i - windowSize + 1);
            int end = i + 1;
            
            List<Double> window = dailySales.subList(start, end).stream()
                    .map(DailySalesDTO::getRevenue)
                    .collect(Collectors.toList());

            double movingAverage = window.stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);

            double stdDev = calculateStandardDeviation(window, movingAverage);

            trendAnalysis.add(TrendAnalysisDTO.builder()
                    .date(dailySales.get(i).getDate())
                    .actualRevenue(dailySales.get(i).getRevenue())
                    .movingAverage(movingAverage)
                    .volatility(stdDev)
                    .build());
        }

        return trendAnalysis;
    }

    /**
     * DATA SCIENCE: Linear Regression Implementation
     */
    private LinearRegressionResult performLinearRegression(List<Double> yValues) {
        int n = yValues.size();
        if (n < 2) {
            return LinearRegressionResult.builder()
                    .slope(0.0)
                    .intercept(yValues.get(0))
                    .predictedValue(yValues.get(0))
                    .rSquared(0.0)
                    .build();
        }

        // Calculate means
        double meanX = (n - 1) / 2.0;  // Mean of [0, 1, 2, ..., n-1]
        double meanY = yValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        // Calculate sums for regression
        double sumXY = 0;
        double sumXX = 0;
        double sumYY = 0;
        double sumResiduals = 0;

        for (int i = 0; i < n; i++) {
            double x = i;
            double y = yValues.get(i);
            
            sumXY += (x - meanX) * (y - meanY);
            sumXX += (x - meanX) * (x - meanX);
            sumYY += (y - meanY) * (y - meanY);
        }

        // Calculate slope and intercept
        double slope = sumXX != 0 ? sumXY / sumXX : 0;
        double intercept = meanY - slope * meanX;

        // Predict next value (day n)
        double predictedValue = slope * n + intercept;

        // Calculate R-squared (coefficient of determination)
        double rSquared = sumXX != 0 && sumYY != 0 ? (sumXY * sumXY) / (sumXX * sumYY) : 0;

        return LinearRegressionResult.builder()
                .slope(slope)
                .intercept(intercept)
                .predictedValue(predictedValue)
                .rSquared(rSquared)
                .build();
    }

    /**
     * DATA SCIENCE: Standard Deviation for volatility
     */
    private double calculateStandardDeviation(List<Double> values, double mean) {
        if (values.isEmpty()) return 0.0;
        
        double sumSquaredDiff = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .sum();
        
        return Math.sqrt(sumSquaredDiff / values.size());
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

    /**
     * Get complete seller dashboard data
     */
    public SellerDashboardDTO getSellerDashboard(Long sellerId) {
        SalesPeriodDTO last30Days = getSalesLast30Days(sellerId);
        SalesPeriodDTO thisMonth = getSalesThisMonth(sellerId);
        SalesPredictionDTO prediction = predictNextMonthSales(sellerId);
        List<DailySalesDTO> weekChart = getDailySalesChart(sellerId, 7);
        List<DailySalesDTO> monthChart = getDailySalesChart(sellerId, 30);
        List<TrendAnalysisDTO> trendAnalysis = getTrendAnalysis(sellerId, 7);

        return SellerDashboardDTO.builder()
                .last30Days(last30Days)
                .thisMonth(thisMonth)
                .prediction(prediction)
                .weeklyChart(weekChart)
                .monthlyChart(monthChart)
                .trendAnalysis(trendAnalysis)
                .build();
    }

    // ======================== DATA CLASSES ========================

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
        private Double confidence;      // R-squared as percentage
        private String trend;            // Growth/Decline indicator
        private Double slope;            // Rate of change
        private Double intercept;        // Y-intercept
        private Double rSquared;         // Model accuracy
    }

    @Data
    @Builder
    public static class TrendAnalysisDTO {
        private String date;
        private Double actualRevenue;
        private Double movingAverage;
        private Double volatility;       // Standard deviation
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

package com.littlebloom.controller;

import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.DataScienceService;
import com.littlebloom.service.OrderService;
import com.littlebloom.service.ProductService;
import com.littlebloom.service.ReviewService;
import com.littlebloom.service.SalesAnalyticsService;
import com.littlebloom.service.SalesAnalyticsService.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class UnifiedAnalyticsController {

    @Autowired
    private SalesAnalyticsService salesAnalyticsService;

    @Autowired(required = false)
    private DataScienceService dataScienceService;

    @Autowired
    private OrderService orderService;

    @Autowired(required = false)
    private ProductService productService;

    @Autowired(required = false)
    private ReviewService reviewService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ds.service.url:http://localhost:5000}")
    private String dsServiceUrl;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            Authentication authentication,
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(defaultValue = "2024") int year) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            var dashboardData = salesAnalyticsService.getDashboardData(
                userDetails.getUserId(), period, year);
            
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Dashboard error: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/sales/last-30-days")
    public ResponseEntity<SalesPeriodDTO> getSalesLast30Days(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesLast30Days(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/sales/week")
    public ResponseEntity<SalesPeriodDTO> getSalesThisWeek(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesThisWeek(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/sales/month")
    public ResponseEntity<SalesPeriodDTO> getSalesThisMonth(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesThisMonth(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/time/dashboard")
    public ResponseEntity<Map<String, Object>> getTimeBasedDashboard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();
            String userRole = userDetails.getRole();

            if (!"SELLER".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied - seller role required"));
            }

            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);

            if (sellerOrders.isEmpty()) {
                return ResponseEntity.ok(createEmptyTimeAnalytics());
            }

            return ResponseEntity.ok(processSellerTimeAnalytics(sellerOrders));

        } catch (Exception e) {
            log.error("Time-based analytics error: ", e);
            return ResponseEntity.ok(createEmptyTimeAnalytics());
        }
    }

    @GetMapping("/time/product")
    public ResponseEntity<Map<String, Object>> getProductAnalytics(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();

            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);

            Map<String, Long> productOrderCounts = sellerOrders.stream()
                    .collect(Collectors.groupingBy(
                            OrderItemDTO::getProductName,
                            Collectors.counting()
                    ));

            List<Map<String, Object>> products = productOrderCounts.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> productMap = new HashMap<>();
                        productMap.put("name", entry.getKey());
                        productMap.put("orders", entry.getValue());
                        return productMap;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("orders"), (Long) a.get("orders")))
                    .limit(6)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("products", products);
            result.put("status", "success");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> fallbackData = new HashMap<>();
            fallbackData.put("products", new ArrayList<>());
            fallbackData.put("status", "success");
            return ResponseEntity.ok(fallbackData);
        }
    }

    @GetMapping("/product/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> getProductRatingAnalytics(@PathVariable Long productId) {
        try {
            if (reviewService == null || dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            List<Double> ratings = reviewService.getProductRatings(productId);
            Map<String, Object> ratingAnalytics = dataScienceService.aggregateRatings(ratings);

            return ResponseEntity.ok(ratingAnalytics);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Rating analytics failed"));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getSmartRecommendations(
            Authentication authentication,
            @RequestParam(required = false) String category) {

        try {
            Long userId = null;
            if (authentication != null) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                userId = userDetails.getUserId();
            }

            if (productService == null || dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            List<Map<String, Object>> products = productService.getAllProductsForRecommendation();
            String userCategory = category != null ? category : "toys";

            Map<String, Object> recommendations = dataScienceService.getProductRecommendations(
                    userCategory, products, userId);

            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Recommendations failed"));
        }
    }

    @PostMapping("/predict/delivery")
    public ResponseEntity<Map<String, Object>> predictDeliveryTime(@RequestBody Map<String, Object> request) {
        try {
            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            double distance = ((Number) request.getOrDefault("distance", 50)).doubleValue();
            double trafficFactor = ((Number) request.getOrDefault("traffic_factor", 1.0)).doubleValue();
            double productWeight = ((Number) request.getOrDefault("product_weight", 1.0)).doubleValue();
            String deliveryType = (String) request.getOrDefault("delivery_type", "standard");

            Map<String, Object> deliveryPrediction = dataScienceService.predictDelivery(
                    distance, trafficFactor, productWeight, deliveryType);

            return ResponseEntity.ok(deliveryPrediction);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Delivery prediction failed"));
        }
    }

    @PostMapping("/sentiment/analyze")
    public ResponseEntity<Map<String, Object>> analyzeFeedbackSentiment(@RequestBody Map<String, String> request) {
        try {
            String feedback = request.get("feedback");

            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback text is required"));
            }

            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            Map<String, Object> sentimentAnalysis = dataScienceService.analyzeSentiment(feedback);

            return ResponseEntity.ok(sentimentAnalysis);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Sentiment analysis failed"));
        }
    }

    @GetMapping("/python/dashboard")
    public ResponseEntity<Map<String, Object>> getPythonDashboard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());

            if (dailySales.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No sales data available"));
            }

            Map<String, Object> request = new HashMap<>();
            request.put("daily_sales", dailySales);
            request.put("daily_orders", dailySales.stream().map(d -> 1L).collect(Collectors.toList()));

            @SuppressWarnings("unchecked")
            Map<String, Object> analytics = (Map<String, Object>) restTemplate.postForObject(
                    dsServiceUrl + "/api/analytics/dashboard",
                    request,
                    LinkedHashMap.class
            );

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Analytics unavailable"));
        }
    }

    @GetMapping("/volatility")
    public ResponseEntity<Map<String, Object>> getVolatility(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("values", dailySales);

            @SuppressWarnings("unchecked")
            Map<String, Object> volatility = (Map<String, Object>) restTemplate.postForObject(
                    dsServiceUrl + "/api/analytics/volatility",
                    request,
                    LinkedHashMap.class
            );

            return ResponseEntity.ok(volatility);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Volatility analysis unavailable"));
        }
    }

    @GetMapping("/anomalies")
    public ResponseEntity<Map<String, Object>> detectAnomalies(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("values", dailySales);
            request.put("threshold", 2.5);

            @SuppressWarnings("unchecked")
            Map<String, Object> anomalies = (Map<String, Object>) restTemplate.postForObject(
                    dsServiceUrl + "/api/analytics/anomalies",
                    request,
                    LinkedHashMap.class
            );

            return ResponseEntity.ok(anomalies);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Anomaly detection unavailable"));
        }
    }

    @GetMapping("/arima-forecast")
    public ResponseEntity<Map<String, Object>> getARIMAForecast(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("values", dailySales);
            request.put("steps", 30);

            @SuppressWarnings("unchecked")
            Map<String, Object> forecast = (Map<String, Object>) restTemplate.postForObject(
                    dsServiceUrl + "/api/analytics/arima-forecast",
                    request,
                    LinkedHashMap.class
            );

            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "ARIMA forecast unavailable"));
        }
    }

    @GetMapping("/correlation")
    public ResponseEntity<Map<String, Object>> getCorrelation(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("revenue", dailySales);
            request.put("orders", dailySales.stream().map(d -> 1.0).collect(Collectors.toList()));

            @SuppressWarnings("unchecked")
            Map<String, Object> correlation = (Map<String, Object>) restTemplate.postForObject(
                    dsServiceUrl + "/api/analytics/correlation",
                    request,
                    LinkedHashMap.class
            );

            return ResponseEntity.ok(correlation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Correlation analysis unavailable"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "Unified Analytics");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("features", Arrays.asList(
                "Core Sales Analytics",
                "Time-Based Analytics",
                "Python DS Integration",
                "Volatility Analysis",
                "Anomaly Detection",
                "ARIMA Forecasting",
                "Correlation Analysis",
                "Smart Recommendations",
                "Delivery Prediction",
                "Sentiment Analysis"
        ));

        return ResponseEntity.ok(health);
    }

    private Map<String, Object> processSellerTimeAnalytics(List<OrderItemDTO> orders) {
        Map<String, Object> result = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.SUNDAY);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        final LocalDate finalStartOfWeek = startOfWeek;
        final LocalDate finalEndOfWeek = endOfWeek;

        List<OrderItemDTO> currentWeekOrders = orders.stream()
                .filter(order -> {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    return !orderDate.isBefore(finalStartOfWeek) && !orderDate.isAfter(finalEndOfWeek);
                })
                .collect(Collectors.toList());

        Map<String, List<OrderItemDTO>> dailyGroups = currentWeekOrders.stream()
                .collect(Collectors.groupingBy(order -> {
                    java.time.DayOfWeek dayOfWeek = order.getCreatedAt().getDayOfWeek();
                    int dayValue = dayOfWeek.getValue() % 7;
                    String[] days = {"SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
                    return days[dayValue];
                }));

        List<Map<String, Object>> dailyData = Arrays.asList("SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY")
                .stream()
                .map(day -> {
                    List<OrderItemDTO> dayOrders = dailyGroups.getOrDefault(day, new ArrayList<>());
                    double revenue = dayOrders.stream()
                            .mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity())
                            .sum();
                    int orderCount = dayOrders.size();

                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("label", day.substring(0, 3));
                    dayMap.put("orders", orderCount);
                    dayMap.put("revenue", Math.round(revenue * 100.0) / 100.0);
                    return dayMap;
                })
                .collect(Collectors.toList());

        Map<String, List<OrderItemDTO>> weeklyGroups = orders.stream()
                .collect(Collectors.groupingBy(order -> {
                    LocalDate date = order.getCreatedAt().toLocalDate();
                    int weekOfYear = date.get(java.time.temporal.WeekFields.ISO.weekOfYear());
                    int year = date.getYear();
                    return year + "-W" + String.format("%02d", weekOfYear);
                }));

        List<Map<String, Object>> weeklyData = weeklyGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(8)
                .map(entry -> {
                    List<OrderItemDTO> weekOrders = entry.getValue();
                    double revenue = weekOrders.stream().mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity()).sum();
                    int orderCount = weekOrders.size();

                    Map<String, Object> weekMap = new HashMap<>();
                    weekMap.put("label", entry.getKey());
                    weekMap.put("orders", orderCount);
                    weekMap.put("revenue", revenue);
                    return weekMap;
                })
                .collect(Collectors.toList());

        Map<String, List<OrderItemDTO>> monthlyGroups = orders.stream()
                .collect(Collectors.groupingBy(order ->
                        order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        List<Map<String, Object>> monthlyData = monthlyGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(12)
                .map(entry -> {
                    List<OrderItemDTO> monthOrders = entry.getValue();
                    double revenue = monthOrders.stream().mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity()).sum();
                    int orderCount = monthOrders.size();

                    Map<String, Object> monthMap = new HashMap<>();
                    monthMap.put("label", entry.getKey());
                    monthMap.put("orders", orderCount);
                    monthMap.put("revenue", revenue);
                    return monthMap;
                })
                .collect(Collectors.toList());

        result.put("daily", dailyData);
        result.put("weekly", weeklyData);
        result.put("monthly", monthlyData);
        result.put("yearly", new ArrayList<>());
        result.put("status", "success");

        return result;
    }

    private Map<String, Object> createEmptyTimeAnalytics() {
        List<String> weekdays = Arrays.asList("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

        List<Map<String, Object>> dailyData = weekdays.stream()
                .map(day -> {
                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("label", day);
                    dayMap.put("orders", 0);
                    dayMap.put("revenue", 0.0);
                    return dayMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("daily", dailyData);
        result.put("weekly", new ArrayList<>());
        result.put("monthly", new ArrayList<>());
        result.put("yearly", new ArrayList<>());
        result.put("status", "success");

        return result;
    }
}

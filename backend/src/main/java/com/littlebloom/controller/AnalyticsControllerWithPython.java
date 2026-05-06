package com.littlebloom.controller;
import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsControllerWithPython {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RestTemplate restTemplate;

    private static final String PYTHON_API = "http://localhost:5000/api/analytics";

    // GET /api/analytics/dashboard - Get complete analytics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            // Get seller orders and extract revenue
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
            List<Double> dailySales = sellerOrders.stream()
                    .map(order -> order.getPrice().doubleValue())
                    .collect(Collectors.toList());
            
            if (dailySales.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No sales data available"));
            }

            // Call Python analytics service
            Map<String, Object> request = new HashMap<>();
            request.put("daily_sales", dailySales);
            request.put("daily_orders", dailySales.stream().map(d -> 1L).collect(Collectors.toList()));
            
            @SuppressWarnings("unchecked")
            Map<String, Object> analytics = (Map<String, Object>) restTemplate.postForObject(
                    PYTHON_API + "/dashboard",
                    request,
                    LinkedHashMap.class
            );
            


            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Analytics unavailable"));
        }
    }

    // GET /api/analytics/prediction/next-month - Revenue prediction
    @GetMapping("/prediction/next-month")
    public ResponseEntity<Map<String, Object>> predictNextMonth(Authentication authentication) {
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
            request.put("daily_sales", dailySales);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> prediction = (Map<String, Object>) restTemplate.postForObject(
                    PYTHON_API + "/predict",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Prediction unavailable"));
        }
    }

    // GET /api/analytics/trend-analysis - Trend analysis
    @GetMapping("/trend-analysis")
    public ResponseEntity<Map<String, Object>> getTrendAnalysis(Authentication authentication) {
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
            request.put("window_size", 7);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> trend = (Map<String, Object>) restTemplate.postForObject(
                    PYTHON_API + "/moving-average",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Trend analysis unavailable"));
        }
    }

    // GET /api/analytics/volatility - Risk assessment
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
                    PYTHON_API + "/volatility",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(volatility);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Volatility analysis unavailable"));
        }
    }

    // GET /api/analytics/anomalies - Anomaly detection
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
                    PYTHON_API + "/anomalies",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(anomalies);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Anomaly detection unavailable"));
        }
    }

    // GET /api/analytics/arima-forecast - 30-day forecast
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
                    PYTHON_API + "/arima-forecast",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "ARIMA forecast unavailable"));
        }
    }

    // GET /api/analytics/correlation - Correlation analysis
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
                    PYTHON_API + "/correlation",
                    request,
                    LinkedHashMap.class
            );
            
            return ResponseEntity.ok(correlation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Correlation analysis unavailable"));
        }
    }

    // GET /api/analytics/sales/week - Weekly sales
    @GetMapping("/sales/week")
    public ResponseEntity<Map<String, Object>> getWeeklySales(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
        Double weeklySales = sellerOrders.stream()
                .map(order -> order.getPrice().doubleValue())
                .reduce(0.0, Double::sum);
        return ResponseEntity.ok(Map.of("weekly_sales", weeklySales));
    }

    // GET /api/analytics/sales/month - Monthly sales
    @GetMapping("/sales/month")
    public ResponseEntity<Map<String, Object>> getMonthlySales(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(userDetails.getUserId());
        Double monthlySales = sellerOrders.stream()
                .map(order -> order.getPrice().doubleValue())
                .reduce(0.0, Double::sum);
        return ResponseEntity.ok(Map.of("monthly_sales", monthlySales));
    }
}
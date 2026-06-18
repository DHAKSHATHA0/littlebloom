package com.littlebloom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class DataScienceService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ds.service.url:http://localhost:5000}")
    private String dsServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Call Python DS service for comprehensive sales analytics
     */
    public Map<String, Object> getSalesAnalytics(List<Map<String, Object>> orders) {
        try {
            String url = dsServiceUrl + "/analytics/sales";
            
            Map<String, Object> request = new HashMap<>();
            request.put("orders", orders);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackSalesAnalytics();
        }
    }

    /**
     * Call Python DS service for sales prediction
     */
    public Map<String, Object> predictSales(List<Double> salesData) {
        try {
            String url = dsServiceUrl + "/predict/sales";
            
            Map<String, Object> request = new HashMap<>();
            request.put("sales", salesData);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackPrediction();
        }
    }

    /**
     * Call Python DS service for rating aggregation
     */
    public Map<String, Object> aggregateRatings(List<Double> ratings) {
        try {
            String url = dsServiceUrl + "/ratings/aggregate";
            
            Map<String, Object> request = new HashMap<>();
            request.put("ratings", ratings);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackRatingAggregation(ratings);
        }
    }

    /**
     * Call Python DS service for product recommendations
     */
    public Map<String, Object> getProductRecommendations(String userCategory, List<Map<String, Object>> products, Long userId) {
        try {
            String url = dsServiceUrl + "/recommend";
            
            Map<String, Object> request = new HashMap<>();
            request.put("user_category", userCategory);
            request.put("products", products);
            if (userId != null) {
                request.put("user_id", userId);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackRecommendations(products);
        }
    }

    /**
     * Call Python DS service for delivery prediction
     */
    public Map<String, Object> predictDelivery(double distance, double trafficFactor, double productWeight, String deliveryType) {
        try {
            String url = dsServiceUrl + "/predict/delivery";
            
            Map<String, Object> request = new HashMap<>();
            request.put("distance", distance);
            request.put("traffic_factor", trafficFactor);
            request.put("product_weight", productWeight);
            request.put("delivery_type", deliveryType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackDeliveryPrediction(distance);
        }
    }

    /**
     * Call Python DS service for sentiment analysis
     */
    public Map<String, Object> analyzeSentiment(String feedback) {
        try {
            String url = dsServiceUrl + "/sentiment";
            
            Map<String, Object> request = new HashMap<>();
            request.put("feedback", feedback);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
            
        } catch (Exception e) {
            // Fallback response
            return createFallbackSentimentAnalysis();
        }
    }

    // Fallback methods for when Python service is unavailable

    private Map<String, Object> createFallbackSalesAnalytics() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("weekly", new ArrayList<>());
        fallback.put("monthly", new ArrayList<>());
        fallback.put("yearly", new ArrayList<>());
        fallback.put("trends", new HashMap<>());
        fallback.put("status", "fallback");
        return fallback;
    }

    private Map<String, Object> createFallbackPrediction() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("next_prediction", 0);
        fallback.put("confidence", 0);
        fallback.put("trend", "Data unavailable");
        fallback.put("future_7_days", Arrays.asList(0, 0, 0, 0, 0, 0, 0));
        fallback.put("status", "fallback");
        return fallback;
    }

    private Map<String, Object> createFallbackRatingAggregation(List<Double> ratings) {
        Map<String, Object> fallback = new HashMap<>();
        if (ratings != null && !ratings.isEmpty()) {
            double avg = ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            fallback.put("average_rating", avg);
            fallback.put("total_ratings", ratings.size());
        } else {
            fallback.put("average_rating", 0.0);
            fallback.put("total_ratings", 0);
        }
        fallback.put("status", "fallback");
        return fallback;
    }

    private Map<String, Object> createFallbackRecommendations(List<Map<String, Object>> products) {
        Map<String, Object> fallback = new HashMap<>();
        List<Map<String, Object>> recommended = new ArrayList<>();
        
        // Simple fallback: return first 3 products
        if (products != null && !products.isEmpty()) {
            int limit = Math.min(3, products.size());
            for (int i = 0; i < limit; i++) {
                Map<String, Object> product = new HashMap<>(products.get(i));
                product.put("recommendation_score", 0.5);
                product.put("reason", "Basic recommendation");
                recommended.add(product);
            }
        }
        
        fallback.put("recommended", recommended);
        fallback.put("algorithm", "fallback");
        fallback.put("status", "fallback");
        return fallback;
    }

    private Map<String, Object> createFallbackDeliveryPrediction(double distance) {
        Map<String, Object> fallback = new HashMap<>();
        int days = Math.max(1, (int) Math.ceil(distance / 40));
        fallback.put("days", days);
        fallback.put("delivery_date", java.time.LocalDate.now().plusDays(days).toString());
        fallback.put("confidence", 0.5);
        fallback.put("status", "fallback");
        return fallback;
    }

    private Map<String, Object> createFallbackSentimentAnalysis() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("sentiment", "neutral");
        fallback.put("polarity", 0.0);
        fallback.put("confidence", 0.0);
        fallback.put("status", "fallback");
        return fallback;
    }
}
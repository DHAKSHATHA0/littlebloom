package com.littlebloom.controller;

import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.SalesAnalyticsService;
import com.littlebloom.service.SalesAnalyticsService.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private SalesAnalyticsService salesAnalyticsService;

    /**
     * Get complete seller dashboard with analytics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<SellerDashboardDTO> getDashboard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SellerDashboardDTO dashboard = salesAnalyticsService.getSellerDashboard(userDetails.getUserId());
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get sales for last 30 days
     */
    @GetMapping("/sales/last-30-days")
    public ResponseEntity<SalesPeriodDTO> getSalesLast30Days(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesLast30Days(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    /**
     * Get sales for this week
     */
    @GetMapping("/sales/week")
    public ResponseEntity<SalesPeriodDTO> getSalesThisWeek(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesThisWeek(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    /**
     * Get sales for this month
     */
    @GetMapping("/sales/month")
    public ResponseEntity<SalesPeriodDTO> getSalesThisMonth(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPeriodDTO sales = salesAnalyticsService.getSalesThisMonth(userDetails.getUserId());
        return ResponseEntity.ok(sales);
    }

    /**
     * Get daily sales chart for visualization
     */
    @GetMapping("/sales/daily")
    public ResponseEntity<List<DailySalesDTO>> getDailySalesChart(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int days) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<DailySalesDTO> dailySales = salesAnalyticsService.getDailySalesChart(userDetails.getUserId(), days);
        return ResponseEntity.ok(dailySales);
    }

    /**
     * DATA SCIENCE: Predict next month sales using Linear Regression
     * 
     * Returns:
     * - Predicted Revenue: Forecasted revenue for next month
     * - Predicted Orders: Forecasted number of orders
     * - Confidence: R-squared value (0-1) indicating model accuracy
     * - Trend: Growth/Decline indicator
     * - Slope: Rate of change in sales
     */
    @GetMapping("/prediction/next-month")
    public ResponseEntity<SalesPredictionDTO> predictNextMonthSales(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        SalesPredictionDTO prediction = salesAnalyticsService.predictNextMonthSales(userDetails.getUserId());
        return ResponseEntity.ok(prediction);
    }

    /**
     * DATA SCIENCE: Trend analysis with moving average and volatility
     * 
     * Uses:
     * - Moving Average: Smooth out daily fluctuations (7-day window)
     * - Volatility: Standard deviation showing price/revenue variation
     * - Actual Revenue: Real daily sales data
     */
    @GetMapping("/trend-analysis")
    public ResponseEntity<List<TrendAnalysisDTO>> getTrendAnalysis(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int windowSize) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<TrendAnalysisDTO> trendAnalysis = salesAnalyticsService.getTrendAnalysis(
                userDetails.getUserId(), 
                windowSize
        );
        return ResponseEntity.ok(trendAnalysis);
    }

    
}

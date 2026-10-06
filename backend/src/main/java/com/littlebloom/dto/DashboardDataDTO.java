package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDataDTO {
    private SummaryDTO summary;
    private List<ChartDataDTO> chartData;
    private List<ChartDataDTO> tableData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryDTO {
        private long totalOrders;
        private double totalRevenue;
        private double averageOrderValue;
        private String period;
        private int year;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartDataDTO {
        private String label;
        private long orders;
        private double revenue;
    }
}

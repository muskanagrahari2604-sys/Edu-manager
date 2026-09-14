package com.student.manager.controller;

import com.student.manager.dto.AnalyticsDto;
import com.student.manager.dto.DashboardSummaryDto;
import com.student.manager.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsDto> getAnalyticsSummary() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }
}

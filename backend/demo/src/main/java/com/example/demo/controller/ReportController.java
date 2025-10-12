package com.example.demo.controller;

import com.example.demo.model.Report;
import com.example.demo.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private ReportService service;

    @PostMapping
    public Report submitReport(@RequestBody Report report) {
        return service.saveReport(report);
    }

    @GetMapping
    public List<Report> getReports() {
        return service.getAllReports();
    }
}


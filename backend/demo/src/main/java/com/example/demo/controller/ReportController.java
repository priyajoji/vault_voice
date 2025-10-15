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

    private final ReportService service;

    @Autowired
    public ReportController(ReportService service) {
        this.service = service;
    }

    @PostMapping
    public Report submitReport(@RequestBody Report report) {
             System.out.println("Received report submission: " + report);
	    return service.saveReport(report);
    }

    @GetMapping
    public List<Report> getReports() {
        List<Report> reports = service.getAllReports();

        // Print current database state to backend console
        System.out.println("=== Current Reports in Database ===");
        reports.forEach(r ->
            System.out.println("ID: " + r.getId() +
                               " | Title: " + r.getTitle() +
                               " | Description: " + r.getDescription() +
                               " | Status: " + r.getStatus())
        );
        System.out.println("---------------------------------");

        return reports; // ✅ return the same list
    }
}


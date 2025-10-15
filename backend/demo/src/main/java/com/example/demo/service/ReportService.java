package com.example.demo.service;

import com.example.demo.model.Report;
import com.example.demo.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository repository;

    public Report saveReport(Report report) {
        // Ensure this is a new report, not an update
        report.setId(null);
        return repository.save(report);
    }

    public List<Report> getAllReports() {
        return repository.findAll();
    }
}


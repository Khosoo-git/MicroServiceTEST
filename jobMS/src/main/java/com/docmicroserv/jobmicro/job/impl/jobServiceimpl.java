package com.docmicroserv.jobmicro.job.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import com.docmicroserv.jobmicro.job.Job;
import com.docmicroserv.jobmicro.job.JobRepository;
import com.docmicroserv.jobmicro.job.JobService; 
import com.docmicroserv.jobmicro.job.mapper.JobMapper;
import com.docmicroserv.jobmicro.job.clients.CompanyClient;
import com.docmicroserv.jobmicro.job.clients.ReviewClient;
import com.docmicroserv.jobmicro.job.dto.JobDto;
import com.docmicroserv.jobmicro.job.external.Company;
import com.docmicroserv.jobmicro.job.external.Review;

@Service
public class JobServiceImpl implements JobService {
    
    private final JobRepository jobRepository;
    private final CompanyClient companyClient;
    private final ReviewClient reviewClient;

    public JobServiceImpl(JobRepository jobRepository, CompanyClient companyClient, ReviewClient reviewClient) {
        this.jobRepository = jobRepository;
        this.companyClient = companyClient;
        this.reviewClient = reviewClient;
    }

    // 🚀 Circuit Breaker on the PUBLIC method!
    @Override
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallback")
    public List<JobDto> findAll() {
        List<Job> jobs = jobRepository.findAll();
        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallbackSingle")
    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id).orElse(null);
        return convertToDTO(job);
    }

    // 🚨 FALLBACK METHODS: Runs when the circuit trips so Gateway doesn't crash!
    public List<JobDto> companyBreakerFallback(Exception e) {
        System.out.println("CIRCUIT BREAKER TRIPPED! Returning empty list for AIOps telemetry.");
        return new ArrayList<>(); 
    }

    public JobDto companyBreakerFallbackSingle(Long id, Exception e) {
        System.out.println("CIRCUIT BREAKER TRIPPED for Job ID " + id);
        return new JobDto(); 
    }

    private JobDto convertToDTO(Job job) {
        if (job == null) return null;

        Company company = null;
        List<Review> reviews = null; 

        if (job.getCompanyId() != null) {
            company = companyClient.getCompany(job.getCompanyId());
            reviews = reviewClient.getReviews(job.getCompanyId());
        }
        return JobMapper.mapToJobWithCompany(job, company, reviews);
    }

    @Override
    public void createJob(Job job) {
        jobRepository.save(job);
    }

    @Override
    public boolean deleteJob(Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateJob(Long id, Job updateJob) {
        Optional<Job> jobOptional = jobRepository.findById(id);
        if (jobOptional.isPresent()) {
            Job job = jobOptional.get();
            job.setTitle(updateJob.getTitle());
            job.setDescription(updateJob.getDescription());
            job.setMinSalory(updateJob.getMinSalory());
            job.setMaxSalory(updateJob.getMaxSalory());
            job.setLocation(updateJob.getLocation());
            jobRepository.save(job);
            return true;
        }
        return false;
    }
}
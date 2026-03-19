package com.docmicroserv.jobmicro.job.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod; // FIXED: Changed to Spring's HttpMethod
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.docmicroserv.jobmicro.job.Job;
import com.docmicroserv.jobmicro.job.JobRepository;
import com.docmicroserv.jobmicro.job.jobService;
import com.docmicroserv.jobmicro.job.Mapper.mapper;
import com.docmicroserv.jobmicro.job.dto.JobDto;
import com.docmicroserv.jobmicro.job.external.Company;
import com.docmicroserv.jobmicro.job.external.Review;

@Service
public class jobServiceimpl implements jobService {
    
    private final JobRepository jobRepository;
    private final RestTemplate restTemplate;

    public jobServiceimpl(JobRepository jobRepository, RestTemplate restTemplate) {
        this.jobRepository = jobRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public List<JobDto> findAll() {
        List<Job> jobs = jobRepository.findAll();
        
        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private JobDto convertToDTO(Job job) {
        if (job == null) {
            return null;
        }

        Company company = null;
        List<Review> reviews = null; // Default to null

        if (job.getCompanyId() != null) {
            // 1. Fetch Company
            try {
                company = restTemplate.getForObject(
                    "http://companyMS/companies/" + job.getCompanyId(), 
                    Company.class
                );
            } catch (Exception e) {
                System.out.println("Could not fetch company " + job.getCompanyId() + ": " + e.getMessage());
            }

            // 2. Fetch Reviews
            try {
                // FIXED: Added '=', removed port 8083, moved inside the try-catch!
                ResponseEntity<List<Review>> reviewResponse = restTemplate.exchange(
                    "http://reviewMS/reviews?companyId=" + job.getCompanyId(), 
                    HttpMethod.GET, 
                    null, 
                    new ParameterizedTypeReference<List<Review>>() {}
                );
                reviews = reviewResponse.getBody();
            } catch (Exception e) {
                System.out.println("Could not fetch reviews for company " + job.getCompanyId() + ": " + e.getMessage());
            }
        }

        return mapper.mapToJobWithCompany(job, company, reviews);
    }

    @Override
    public void createJob(Job job) {
        jobRepository.save(job);
    }

    @Override
    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id).orElse(null);
        return convertToDTO(job);
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
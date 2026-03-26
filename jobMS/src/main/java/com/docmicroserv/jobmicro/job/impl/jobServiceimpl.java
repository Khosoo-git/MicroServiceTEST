package com.docmicroserv.jobmicro.job.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
    
    // Everything is clean and final!
    private final JobRepository jobRepository;
    private final CompanyClient companyClient;
    private final ReviewClient reviewClient;

    // RestTemplate is GONE!
    public JobServiceImpl(JobRepository jobRepository, CompanyClient companyClient, ReviewClient reviewClient) {
        this.jobRepository = jobRepository;
        this.companyClient = companyClient;
        this.reviewClient = reviewClient;
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
        List<Review> reviews = null; 

        if (job.getCompanyId() != null) {
            // 1. Fetch Company using Feign!
            try {
                company = companyClient.getCompany(job.getCompanyId());
            } catch (Exception e) {
                System.out.println("Could not fetch company " + job.getCompanyId() + ": " + e.getMessage());
            }

            // 2. Fetch Reviews using Feign!
            try {
                // FIXED: Removed the 'List<Review>' declaration so it fills the outer variable
                reviews = reviewClient.getReviews(job.getCompanyId());
            } catch (Exception e) {
                System.out.println("Could not fetch reviews for company " + job.getCompanyId() + ": " + e.getMessage());
            }
        }

        return JobMapper.mapToJobWithCompany(job, company, reviews);
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
package com.docmicroserv.jobmicro.job.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.docmicroserv.jobmicro.job.Job;
import com.docmicroserv.jobmicro.job.JobRepository;
import com.docmicroserv.jobmicro.job.jobService;
import com.docmicroserv.jobmicro.job.dto.JobWithCompany;
import com.docmicroserv.jobmicro.job.external.Company;

@Service
public class jobServiceimpl implements jobService {
    
    // Changed: Made fields final and added restTemplate
    private final JobRepository jobRepository;
    private final RestTemplate restTemplate;

    // Changed: Constructor now injects both the repository and the restTemplate bean
    public jobServiceimpl(JobRepository jobRepository, RestTemplate restTemplate) {
        this.jobRepository = jobRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public List<JobWithCompany> findAll() {
        List<Job> jobs = jobRepository.findAll();
        
        // Return the stream directly, no unused empty lists hanging around!
        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private JobWithCompany convertToDTO(Job job) {
            JobWithCompany jobWithCompany = new JobWithCompany();
            jobWithCompany.setJob(job);

            if (job.getCompanyId() != null) {
                try {
                    // Changed: Now uses the injected 'this.restTemplate'
                    Company company = restTemplate.getForObject(
                        "http://localhost:8081/companies/" + job.getCompanyId(), 
                        Company.class
                    );
                    jobWithCompany.setCompany(company);
                } catch (Exception e) {
                    System.out.println("Could not fetch company " + job.getCompanyId() + ": " + e.getMessage());
                    jobWithCompany.setCompany(null); 
                }
            }

            return jobWithCompany;
    }

    @Override
    public void createJob(Job job) {
        jobRepository.save(job);
    }

    @Override
    public Job getJobById(Long id) {
        return jobRepository.findById(id).orElse(null);
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
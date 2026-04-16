package com.docmicroserv.jobmicro.job;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docmicroserv.jobmicro.job.dto.JobDto;

// 🛡️ The Resilience4j Import
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@RestController
@RequestMapping("/jobs")
public class JobController {
    private JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // -------------------------------------------------------------
    // 🛡️ SHIELD 1: PROTECTING THE "FIND ALL" METHOD
    // -------------------------------------------------------------
    @GetMapping   
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "findAllFallback")
    public ResponseEntity<List<JobDto>> findAll(){
        return ResponseEntity.ok(jobService.findAll());
    }

    // THE SAFETY NET FOR "FIND ALL"
    public ResponseEntity<List<JobDto>> findAllFallback(Exception e) {
        System.out.println("🚨 SHIELD ACTIVATED: Company Service is down! Exception: " + e.getMessage());
        // Return an empty list so the frontend doesn't completely crash!
        return new ResponseEntity<>(new ArrayList<>(), HttpStatus.SERVICE_UNAVAILABLE);
    }


    @PostMapping
    public ResponseEntity<String> createJob(@RequestBody Job job){
        jobService.createJob(job);
        return new ResponseEntity<>("Job created successfully",HttpStatus.CREATED);
    }


    // -------------------------------------------------------------
    // 🛡️ SHIELD 2: PROTECTING THE "FIND BY ID" METHOD
    // -------------------------------------------------------------
    @GetMapping("/{id}")
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "getJobByIdFallback")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        JobDto jobWithCompany = jobService.getJobById(id);
        if (jobWithCompany != null) {
            return new ResponseEntity<>(jobWithCompany,HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // THE SAFETY NET FOR "FIND BY ID"
    // (Must have the exact same parameters as the original, plus Exception at the end!)
    public ResponseEntity<JobDto> getJobByIdFallback(Long id, Exception e) {
        System.out.println("🚨 SHIELD ACTIVATED for Job ID " + id + ": Company Service is down!");
        
        JobDto dummyJob = new JobDto();
        // NOTE: If you have setters like dummyJob.setTitle(), you can set a default message here!
        
        // Return a 503 Service Unavailable with the dummy DTO
        return new ResponseEntity<>(dummyJob, HttpStatus.SERVICE_UNAVAILABLE);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        boolean deleted = jobService.deleteJob(id);
        if (deleted) {
            return new ResponseEntity<>("Job deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Job not found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateJob(@PathVariable Long id, @RequestBody Job job) {
        boolean updated = jobService.updateJob(id, job);
        if (updated) {
            return new ResponseEntity<>("Job updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Job not found", HttpStatus.NOT_FOUND);
        }
    }
}
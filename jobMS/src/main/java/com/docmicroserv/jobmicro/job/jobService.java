package com.docmicroserv.jobmicro.job;

import java.util.List;

import com.docmicroserv.jobmicro.job.dto.JobWithCompany;

public interface jobService {

    List<JobWithCompany> findAll();
    
    void createJob(Job job);

    Job getJobById(Long id);

    boolean deleteJob(Long id);
    
    boolean updateJob(Long id, Job job);
    
}

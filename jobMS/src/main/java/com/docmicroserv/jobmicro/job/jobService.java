package com.docmicroserv.jobmicro.job;

import java.util.List;

public interface jobService {
    List<Job> findAll();
    void createJob(Job job);

    Job getJobById(Long id);

    boolean deleteJob(Long id);
    
    boolean updateJob(Long id, Job job);
    
}

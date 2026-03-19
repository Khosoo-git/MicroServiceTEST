package com.docmicroserv.jobmicro.job;

import java.util.List;

import com.docmicroserv.jobmicro.job.dto.JobDto;

public interface jobService {

    List<JobDto> findAll();
    
    void createJob(Job job);

    JobDto getJobById(Long id);

    boolean deleteJob(Long id);
    
    boolean updateJob(Long id, Job job);
    
}

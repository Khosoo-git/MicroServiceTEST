package com.docmicroserv.jobmicro.job.dto;

import com.docmicroserv.jobmicro.job.Job;
import com.docmicroserv.jobmicro.job.external.Company;

public class JobWithCompany {

    private Job job;

    private Company company;

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    

}
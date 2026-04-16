package com.docmicroserv.jobmicro.job.mapper;

import java.util.List;

import com.docmicroserv.jobmicro.job.Job;
import com.docmicroserv.jobmicro.job.dto.JobDto;
import com.docmicroserv.jobmicro.job.external.Company;
import com.docmicroserv.jobmicro.job.external.Review;

public class JobMapper {

    public static JobDto mapToJobWithCompany(Job job, Company company, List<Review> reviews) {
        if (job == null) {
            return null;
        }

        JobDto jobWithCompany = new JobDto();
        jobWithCompany.setId(job.getId());
        jobWithCompany.setTitle(job.getTitle());
        jobWithCompany.setDescription(job.getDescription());
        jobWithCompany.setMinSalary(job.getMinSalary());
        jobWithCompany.setMaxSalary(job.getMaxSalary());
        jobWithCompany.setLocation(job.getLocation());
        jobWithCompany.setCompany(company);
        jobWithCompany.setReviews(reviews);
        return jobWithCompany;

    }

}

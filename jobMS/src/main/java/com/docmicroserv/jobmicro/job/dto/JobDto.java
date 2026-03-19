package com.docmicroserv.jobmicro.job.dto;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import com.docmicroserv.jobmicro.job.external.Company;
import com.docmicroserv.jobmicro.job.external.Review;

@JsonPropertyOrder({
    "id",
    "title",
    "description",
    "location",
    "minSalory", 
    "maxSalory",
    "company",
    "reviews"
})

public class JobDto {

    private Long id;
    private String title ;
    private String description;
    private String minSalory;
    private String maxSalory;
    private String location;
    private Company company;
    private List<Review> reviews;

    

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMinSalory() {
        return minSalory;
    }

    public void setMinSalory(String minSalory) {
        this.minSalory = minSalory;
    }

    public String getMaxSalory() {
        return maxSalory;
    }

    public void setMaxSalory(String maxSalory) {
        this.maxSalory = maxSalory;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

  

    

}
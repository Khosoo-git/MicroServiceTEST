package com.docmicroserv.jobmicro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class JobmicroApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobmicroApplication.class, args);
	}

}

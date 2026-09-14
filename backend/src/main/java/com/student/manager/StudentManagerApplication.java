package com.student.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentManagerApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("  Student Assignment & Exam Manager Backend Started!       ");
        System.out.println("  Server running at: http://localhost:8080               ");
        System.out.println("  REST API Endpoints: http://localhost:8080/api           ");
        System.out.println("==========================================================");
    }
}

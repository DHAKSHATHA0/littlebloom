package com.littlebloom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LittleBloomApplication {

    public static void main(String[] args) {
        SpringApplication.run(LittleBloomApplication.class, args);
    }
}

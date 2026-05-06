package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role; // BUYER or SELLER
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String phone;
}
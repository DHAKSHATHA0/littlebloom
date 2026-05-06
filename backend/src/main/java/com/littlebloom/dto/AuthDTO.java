package com.littlebloom.dto;

import com.littlebloom.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String phone;

    public static AuthDTO fromUser(User user) {
        return AuthDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .postalCode(user.getPostalCode())
                .phone(user.getPhone())
                .build();
    }
}

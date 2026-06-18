package com.littlebloom.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // BUYER or SELLER

    @Column(unique = true, nullable = true)
    private String buyerId; // Format: by0001, by0002, etc.

    @Column(unique = true, nullable = true)
    private String sellerId; // Format: se0001, se0002, etc.

    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String phone;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PostPersist
    public void generateIds() {
        if (this.id != null) {
            String formattedId = String.format("%04d", this.id);
            if (this.role == Role.BUYER && this.buyerId == null) {
                this.buyerId = "by" + formattedId;
            } else if (this.role == Role.SELLER && this.sellerId == null) {
                this.sellerId = "se" + formattedId;
            }
        }
    }

    public enum Role {
        BUYER, SELLER
    }
}

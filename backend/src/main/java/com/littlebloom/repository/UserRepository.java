package com.littlebloom.repository;

import com.littlebloom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.Role role);
    Optional<User> findByBuyerId(String buyerId);
    Optional<User> findBySellerId(String sellerId);
}

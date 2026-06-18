package com.littlebloom.controller;

import com.littlebloom.dto.UserDTO;
import com.littlebloom.model.User;
import com.littlebloom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all users with their buyer_id and seller_id
     * Used by sellers to identify buyers in their orders
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get a specific user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user by buyer_id (format: by0001, by0002, etc.)
     */
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<UserDTO> getUserByBuyerId(@PathVariable String buyerId) {
        return userRepository.findByBuyerId(buyerId)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user by seller_id (format: se0001, se0002, etc.)
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<UserDTO> getUserBySellerId(@PathVariable String sellerId) {
        return userRepository.findBySellerId(sellerId)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Assign missing buyer_id and seller_id to existing users
     * This is a one-time migration endpoint
     */
    @PostMapping("/assign-missing-ids")
    public ResponseEntity<String> assignMissingIds() {
        try {
            List<User> users = userRepository.findAll();
            int updatedCount = 0;
            
            for (User user : users) {
                boolean updated = false;
                String formattedId = String.format("%04d", user.getId());
                
                if (user.getRole() == User.Role.BUYER && user.getBuyerId() == null) {
                    user.setBuyerId("by" + formattedId);
                    updated = true;
                } else if (user.getRole() == User.Role.SELLER && user.getSellerId() == null) {
                    user.setSellerId("se" + formattedId);
                    updated = true;
                }
                
                if (updated) {
                    userRepository.save(user);
                    updatedCount++;
                }
            }
            
            return ResponseEntity.ok("Successfully assigned IDs to " + updatedCount + " users");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error assigning IDs: " + e.getMessage());
        }
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.fromUser(user);
    }
}

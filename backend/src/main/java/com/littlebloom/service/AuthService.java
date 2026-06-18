package com.littlebloom.service;
import com.littlebloom.dto.AuthRequest;
import com.littlebloom.dto.AuthResponse;
import com.littlebloom.dto.SignupRequest;
import com.littlebloom.dto.UserDTO;
import com.littlebloom.model.User;
import com.littlebloom.repository.UserRepository;
import com.littlebloom.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartService cartService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .phone(request.getPhone())
                .build();

        user = userRepository.save(user);
        
        // Generate and save buyer/seller ID after initial save
        if (user.getId() != null) {
            String formattedId = String.format("%04d", user.getId());
            if (user.getRole() == User.Role.BUYER) {
                user.setBuyerId("by" + formattedId);
            } else if (user.getRole() == User.Role.SELLER) {
                user.setSellerId("se" + formattedId);
            }
            user = userRepository.save(user);
        }

        // Create cart for buyers
        if (user.getRole() == User.Role.BUYER) {
            cartService.getOrCreateCart(user);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .token(token)
                .user(UserDTO.fromUser(user))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .token(token)
                .user(UserDTO.fromUser(user))
                .build();
    }

    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDTO.fromUser(user);
    }

    public UserDTO updateUserProfile(Long userId, SignupRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPostalCode(request.getPostalCode());
        user.setPhone(request.getPhone());

        user = userRepository.save(user);
        return UserDTO.fromUser(user);
    }
    
    public void assignMissingUserIds() {
        List<User> usersWithoutIds = userRepository.findAll().stream()
                .filter(user -> (user.getRole() == User.Role.BUYER && user.getBuyerId() == null) ||
                               (user.getRole() == User.Role.SELLER && user.getSellerId() == null))
                .collect(Collectors.toList());
        
        for (User user : usersWithoutIds) {
            String formattedId = String.format("%04d", user.getId());
            if (user.getRole() == User.Role.BUYER && user.getBuyerId() == null) {
                user.setBuyerId("by" + formattedId);
            } else if (user.getRole() == User.Role.SELLER && user.getSellerId() == null) {
                user.setSellerId("se" + formattedId);
            }
            userRepository.save(user);
        }
    }
}

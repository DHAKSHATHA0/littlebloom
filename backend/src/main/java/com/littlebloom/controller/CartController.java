package com.littlebloom.controller;

import com.littlebloom.dto.AddToCartRequest;
import com.littlebloom.dto.CartDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(
            Authentication authentication,
            @RequestBody AddToCartRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        CartDTO cart = cartService.addToCart(userDetails.getUserId(), request);
        return ResponseEntity.ok(cart);
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        CartDTO cart = cartService.getCart(userDetails.getUserId());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(
            Authentication authentication,
            @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        CartDTO cart = cartService.removeFromCart(userDetails.getUserId(), productId);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<CartDTO> updateCartQuantity(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        CartDTO cart = cartService.updateCartItemQuantity(userDetails.getUserId(), productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        cartService.clearCart(userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}

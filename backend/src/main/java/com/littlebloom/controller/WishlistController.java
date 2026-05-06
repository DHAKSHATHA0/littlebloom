package com.littlebloom.controller;

import com.littlebloom.dto.AddToWishlistRequest;
import com.littlebloom.dto.ProductDTO;
import com.littlebloom.dto.WishlistDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping
    public ResponseEntity<WishlistDTO> addToWishlist(
            Authentication authentication,
            @RequestBody AddToWishlistRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        WishlistDTO wishlist = wishlistService.addToWishlist(userDetails.getUserId(), request);
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        wishlistService.removeFromWishlist(userDetails.getUserId(), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getWishlist(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<WishlistDTO> wishlist = wishlistService.getUserWishlist(userDetails.getUserId());
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> isInWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        boolean inWishlist = wishlistService.isInWishlist(userDetails.getUserId(), productId);
        return ResponseEntity.ok(inWishlist);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getWishlistProducts(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ProductDTO> products = wishlistService.getWishlistProducts(userDetails.getUserId());
        return ResponseEntity.ok(products);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearWishlist(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        wishlistService.clearWishlist(userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getWishlistCount(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        long count = wishlistService.getWishlistCount(userDetails.getUserId());
        return ResponseEntity.ok(count);
    }
}
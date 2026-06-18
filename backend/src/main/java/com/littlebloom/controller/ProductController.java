package com.littlebloom.controller;

import com.littlebloom.dto.CreateProductRequest;
import com.littlebloom.dto.ProductDTO;
import com.littlebloom.dto.UpdateProductRequest;
import com.littlebloom.model.Product;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    /*@PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            Authentication authentication,
            @RequestBody CreateProductRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ProductDTO product = productService.createProduct(userDetails.getUserId(), request);
        return ResponseEntity.ok(product);
    }*/
   @PostMapping
public ResponseEntity<ProductDTO> createProduct(
        Authentication authentication,
        @RequestBody CreateProductRequest request) {

    if (authentication == null) {
        return ResponseEntity.status(401).build();
    }

    CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

    ProductDTO product = productService.createProduct(
            userDetails.getUserId(),
            request
    );

    return ResponseEntity.ok(product);
}

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ProductDTO product = productService.updateProduct(id, userDetails.getUserId(), request);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            Authentication authentication,
            @PathVariable Long id) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        productService.deleteProduct(id, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.searchProducts(search, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByCategory(category, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductDTO>> getSellerProducts(@PathVariable Long sellerId) {
        List<ProductDTO> products = productService.getSellerProducts(sellerId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/categories/all")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<ProductDTO>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductDTO> products = productService.getTopSellingProducts(limit);
        return ResponseEntity.ok(products);
    }
}

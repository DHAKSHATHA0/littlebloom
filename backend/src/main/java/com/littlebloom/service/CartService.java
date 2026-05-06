package com.littlebloom.service;

import com.littlebloom.dto.AddToCartRequest;
import com.littlebloom.dto.CartDTO;
import com.littlebloom.dto.CartItemDTO;
import com.littlebloom.model.Cart;
import com.littlebloom.model.CartItem;
import com.littlebloom.model.Product;
import com.littlebloom.model.User;
import com.littlebloom.repository.CartItemRepository;
import com.littlebloom.repository.CartRepository;
import com.littlebloom.repository.ProductRepository;
import com.littlebloom.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartDTO addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock available");
        }

        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartItemRepository.save(cartItem);
        return getCartDTO(cart);
    }

    @Transactional
    public CartDTO removeFromCart(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        cartItemRepository.delete(cartItem);
        return getCartDTO(cart);
    }

    @Transactional
    public CartDTO updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            if (product.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock available");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCartDTO(cart);
    }

    public CartDTO getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = getOrCreateCart(user);
        return getCartDTO(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = getOrCreateCart(user);

        List<CartItem> items = cartItemRepository.findByCart(cart);
        cartItemRepository.deleteAll(items);
    }

    private CartDTO getCartDTO(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart(cart);
        BigDecimal totalPrice = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CartItemDTO> itemDTOs = items.stream()
                .map(item -> CartItemDTO.builder()
                        .id(item.getId())
                        .cartId(cart.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .category(item.getProduct().getCategory())
                        .price(item.getProduct().getPrice())
                        .quantity(item.getQuantity())
                        .imageUrl(item.getProduct().getImageUrl())
                        .sellerId(item.getProduct().getSeller().getId())
                        .createdAt(item.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOs)
                .totalPrice(totalPrice)
                .createdAt(cart.getCreatedAt())
                .build();
    }
}

package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}

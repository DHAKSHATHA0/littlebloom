package com.littlebloom.repository;

import com.littlebloom.model.Notification;
import com.littlebloom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverId(Long receiverId);
    List<Notification> findByReceiver(User receiver);
    List<Notification> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Notification> findByReceiverIdAndIsReadFalse(Long receiverId);
    List<Notification> findByReceiverAndIsReadFalse(User receiver);
    
    @Query("SELECT n FROM Notification n WHERE n.receiver.id = :receiverId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotifications(@Param("receiverId") Long receiverId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.receiver.id = :receiverId AND n.isRead = false")
    long countUnreadNotifications(@Param("receiverId") Long receiverId);
    
    @Query("SELECT n FROM Notification n WHERE n.receiver.id = :receiverId ORDER BY n.createdAt DESC")
    List<Notification> findAllNotifications(@Param("receiverId") Long receiverId);
}

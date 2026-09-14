package com.student.manager.repository;

import com.student.manager.entity.Assignment;
import com.student.manager.entity.AssignmentStatus;
import com.student.manager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByUserOrderByDueDateAsc(User user);
    List<Assignment> findByUserAndStatusOrderByDueDateAsc(User user, AssignmentStatus status);

    long countByUser(User user);
    long countByUserAndStatus(User user, AssignmentStatus status);

    @Query("SELECT a FROM Assignment a WHERE a.user = :user AND a.status != 'COMPLETED' AND a.dueDate BETWEEN :now AND :endWindow ORDER BY a.dueDate ASC")
    List<Assignment> findDueSoon(@Param("user") User user, @Param("now") LocalDateTime now, @Param("endWindow") LocalDateTime endWindow);

    @Query("SELECT a FROM Assignment a WHERE a.user = :user AND a.status != 'COMPLETED' AND a.dueDate < :now ORDER BY a.dueDate ASC")
    List<Assignment> findOverdue(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT a.subject, COUNT(a) FROM Assignment a WHERE a.user = :user GROUP BY a.subject")
    List<Object[]> countAssignmentsBySubject(@Param("user") User user);
}

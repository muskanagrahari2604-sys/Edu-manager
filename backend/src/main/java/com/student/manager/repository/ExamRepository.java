package com.student.manager.repository;

import com.student.manager.entity.Exam;
import com.student.manager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByUserOrderByExamDateAscExamTimeAsc(User user);

    long countByUser(User user);

    @Query("SELECT e FROM Exam e WHERE e.user = :user AND e.examDate >= :currentDate ORDER BY e.examDate ASC, e.examTime ASC")
    List<Exam> findUpcomingExams(@Param("user") User user, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT e.preparationStatus, COUNT(e) FROM Exam e WHERE e.user = :user GROUP BY e.preparationStatus")
    List<Object[]> countExamsByPreparationStatus(@Param("user") User user);
}

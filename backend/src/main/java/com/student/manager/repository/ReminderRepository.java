package com.student.manager.repository;

import com.student.manager.entity.Reminder;
import com.student.manager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserOrderByReminderDateDesc(User user);
    List<Reminder> findByUserAndIsReadFalseOrderByReminderDateAsc(User user);
    long countByUserAndIsReadFalse(User user);
}

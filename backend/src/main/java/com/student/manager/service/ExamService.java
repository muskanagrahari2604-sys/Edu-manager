package com.student.manager.service;

import com.student.manager.config.UserContext;
import com.student.manager.dto.ExamDto;
import com.student.manager.entity.Exam;
import com.student.manager.entity.PreparationStatus;
import com.student.manager.entity.Priority;
import com.student.manager.entity.User;
import com.student.manager.repository.ExamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    private User getAuthenticatedUser() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Authentication required to access exams.");
        }
        return user;
    }

    public List<ExamDto> getAllExams(String prepStatusFilter, String priorityFilter, String sortBy) {
        User user = getAuthenticatedUser();
        List<Exam> exams = examRepository.findByUserOrderByExamDateAscExamTimeAsc(user);

        return exams.stream()
                .filter(e -> {
                    if (prepStatusFilter != null && !prepStatusFilter.isBlank() && !prepStatusFilter.equalsIgnoreCase("ALL")) {
                        return e.getPreparationStatus().name().equalsIgnoreCase(prepStatusFilter);
                    }
                    return true;
                })
                .filter(e -> {
                    if (priorityFilter != null && !priorityFilter.isBlank() && !priorityFilter.equalsIgnoreCase("ALL")) {
                        return e.getPriority().name().equalsIgnoreCase(priorityFilter);
                    }
                    return true;
                })
                .sorted((e1, e2) -> {
                    if ("newest".equalsIgnoreCase(sortBy)) {
                        return e2.getCreatedAt().compareTo(e1.getCreatedAt());
                    } else if ("priority".equalsIgnoreCase(sortBy)) {
                        return Integer.compare(priorityRank(e2.getPriority()), priorityRank(e1.getPriority()));
                    } else {
                        // Default: exam date asc
                        int dateCmp = e1.getExamDate().compareTo(e2.getExamDate());
                        return dateCmp != 0 ? dateCmp : e1.getExamTime().compareTo(e2.getExamTime());
                    }
                })
                .map(ExamDto::new)
                .collect(Collectors.toList());
    }

    private int priorityRank(Priority p) {
        if (p == Priority.HIGH) return 3;
        if (p == Priority.MEDIUM) return 2;
        return 1;
    }

    public List<ExamDto> getUpcomingExams() {
        User user = getAuthenticatedUser();
        return examRepository.findUpcomingExams(user, LocalDate.now())
                .stream()
                .map(ExamDto::new)
                .collect(Collectors.toList());
    }

    public ExamDto getExamById(Long id) {
        User user = getAuthenticatedUser();
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + id));
        return new ExamDto(exam);
    }

    @Transactional
    public ExamDto createExam(ExamDto dto) {
        User user = getAuthenticatedUser();

        Exam exam = new Exam();
        exam.setUser(user);
        exam.setSubject(dto.getSubject().trim());
        exam.setExamTitle(dto.getExamTitle().trim());
        exam.setExamDate(dto.getExamDate());
        exam.setExamTime(dto.getExamTime());
        exam.setVenue(dto.getVenue() != null ? dto.getVenue().trim() : "Main Academic Hall");
        exam.setSyllabus(dto.getSyllabus());
        exam.setPreparationStatus(dto.getPreparationStatus() != null ? dto.getPreparationStatus() : PreparationStatus.NOT_STARTED);
        exam.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.HIGH);

        Exam saved = examRepository.save(exam);
        return new ExamDto(saved);
    }

    @Transactional
    public ExamDto updateExam(Long id, ExamDto dto) {
        User user = getAuthenticatedUser();
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + id));

        exam.setSubject(dto.getSubject().trim());
        exam.setExamTitle(dto.getExamTitle().trim());
        exam.setExamDate(dto.getExamDate());
        exam.setExamTime(dto.getExamTime());
        exam.setVenue(dto.getVenue());
        exam.setSyllabus(dto.getSyllabus());
        if (dto.getPreparationStatus() != null) {
            exam.setPreparationStatus(dto.getPreparationStatus());
        }
        if (dto.getPriority() != null) {
            exam.setPriority(dto.getPriority());
        }

        Exam updated = examRepository.save(exam);
        return new ExamDto(updated);
    }

    @Transactional
    public void deleteExam(Long id) {
        User user = getAuthenticatedUser();
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + id));

        examRepository.delete(exam);
    }
}

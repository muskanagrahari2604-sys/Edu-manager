package com.student.manager.service;

import com.student.manager.config.UserContext;
import com.student.manager.dto.AssignmentDto;
import com.student.manager.entity.Assignment;
import com.student.manager.entity.AssignmentStatus;
import com.student.manager.entity.Priority;
import com.student.manager.entity.User;
import com.student.manager.repository.AssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    private User getAuthenticatedUser() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Authentication required to access assignments.");
        }
        return user;
    }

    public List<AssignmentDto> getAllAssignments(String statusFilter, String priorityFilter, String subjectFilter, String sortBy) {
        User user = getAuthenticatedUser();
        List<Assignment> assignments = assignmentRepository.findByUserOrderByDueDateAsc(user);

        return assignments.stream()
                .filter(a -> {
                    if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
                        return a.getStatus().name().equalsIgnoreCase(statusFilter);
                    }
                    return true;
                })
                .filter(a -> {
                    if (priorityFilter != null && !priorityFilter.isBlank() && !priorityFilter.equalsIgnoreCase("ALL")) {
                        return a.getPriority().name().equalsIgnoreCase(priorityFilter);
                    }
                    return true;
                })
                .filter(a -> {
                    if (subjectFilter != null && !subjectFilter.isBlank() && !subjectFilter.equalsIgnoreCase("ALL")) {
                        return a.getSubject().equalsIgnoreCase(subjectFilter);
                    }
                    return true;
                })
                .sorted((a1, a2) -> {
                    if ("newest".equalsIgnoreCase(sortBy)) {
                        return a2.getCreatedAt().compareTo(a1.getCreatedAt());
                    } else if ("oldest".equalsIgnoreCase(sortBy)) {
                        return a1.getCreatedAt().compareTo(a2.getCreatedAt());
                    } else if ("priority".equalsIgnoreCase(sortBy)) {
                        return Integer.compare(priorityRank(a2.getPriority()), priorityRank(a1.getPriority()));
                    } else {
                        // Default: nearest deadline
                        return a1.getDueDate().compareTo(a2.getDueDate());
                    }
                })
                .map(AssignmentDto::new)
                .collect(Collectors.toList());
    }

    private int priorityRank(Priority p) {
        if (p == Priority.HIGH) return 3;
        if (p == Priority.MEDIUM) return 2;
        return 1;
    }

    public AssignmentDto getAssignmentById(Long id) {
        User user = getAuthenticatedUser();
        Assignment assignment = assignmentRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));
        return new AssignmentDto(assignment);
    }

    @Transactional
    public AssignmentDto createAssignment(AssignmentDto dto) {
        User user = getAuthenticatedUser();

        Assignment assignment = new Assignment();
        assignment.setUser(user);
        assignment.setTitle(dto.getTitle().trim());
        assignment.setSubject(dto.getSubject().trim());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        assignment.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM);
        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : AssignmentStatus.PENDING);
        assignment.setAttachmentName(dto.getAttachmentName());

        Assignment saved = assignmentRepository.save(assignment);
        return new AssignmentDto(saved);
    }

    @Transactional
    public AssignmentDto updateAssignment(Long id, AssignmentDto dto) {
        User user = getAuthenticatedUser();
        Assignment assignment = assignmentRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));

        assignment.setTitle(dto.getTitle().trim());
        assignment.setSubject(dto.getSubject().trim());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        if (dto.getPriority() != null) {
            assignment.setPriority(dto.getPriority());
        }
        if (dto.getStatus() != null) {
            assignment.setStatus(dto.getStatus());
        }
        assignment.setAttachmentName(dto.getAttachmentName());

        Assignment updated = assignmentRepository.save(assignment);
        return new AssignmentDto(updated);
    }

    @Transactional
    public AssignmentDto toggleComplete(Long id) {
        User user = getAuthenticatedUser();
        Assignment assignment = assignmentRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));

        if (assignment.getStatus() == AssignmentStatus.COMPLETED) {
            assignment.setStatus(AssignmentStatus.PENDING);
        } else {
            assignment.setStatus(AssignmentStatus.COMPLETED);
        }

        Assignment updated = assignmentRepository.save(assignment);
        return new AssignmentDto(updated);
    }

    @Transactional
    public AssignmentDto updateStatus(Long id, AssignmentStatus status) {
        User user = getAuthenticatedUser();
        Assignment assignment = assignmentRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));

        assignment.setStatus(status != null ? status : AssignmentStatus.PENDING);
        Assignment updated = assignmentRepository.save(assignment);
        return new AssignmentDto(updated);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        User user = getAuthenticatedUser();
        Assignment assignment = assignmentRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));

        assignmentRepository.delete(assignment);
    }
}

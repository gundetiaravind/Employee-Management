package com.ems.project.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.project.entity.EmployeeProject;
import com.ems.project.repository.EmployeeProjectRepository;
import com.ems.project.repository.ProjectRepository;

@Service
public class EmployeeProjectServiceImpl
        implements EmployeeProjectService {

    private final EmployeeProjectRepository assignmentRepository;
    private final ProjectRepository projectRepository;

    public EmployeeProjectServiceImpl(
            EmployeeProjectRepository assignmentRepository,
            ProjectRepository projectRepository) {

        this.assignmentRepository = assignmentRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    public EmployeeProject assignEmployeeToProject(
            Long employeeId, Long projectId, String tenantId) {

        projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        EmployeeProject assignment = new EmployeeProject();

        assignment.setTenantId(tenantId);
        assignment.setEmployeeId(employeeId);
        assignment.setProjectId(projectId);
        assignment.setStartDate(LocalDate.now());
        assignment.setAssignmentStatus("ACTIVE");

        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public EmployeeProject changeProjectAssignment(
            Long assignmentId, Long newProjectId, String tenantId) {

        EmployeeProject oldAssignment =
                getAssignmentById(assignmentId, tenantId);

        projectRepository.findByIdAndTenantId(newProjectId, tenantId)
                .orElseThrow(() ->
                        new RuntimeException("New project not found"));

        if (!"ACTIVE".equals(oldAssignment.getAssignmentStatus())) {
            throw new RuntimeException("Assignment is not active");
        }

        oldAssignment.setEndDate(LocalDate.now());
        oldAssignment.setAssignmentStatus("CLOSED");

        assignmentRepository.save(oldAssignment);

        EmployeeProject newAssignment = new EmployeeProject();

        newAssignment.setTenantId(tenantId);
        newAssignment.setEmployeeId(oldAssignment.getEmployeeId());
        newAssignment.setProjectId(newProjectId);
        newAssignment.setStartDate(LocalDate.now());
        newAssignment.setAssignmentStatus("ACTIVE");

        return assignmentRepository.save(newAssignment);
    }

    @Override
    public EmployeeProject closeProjectAssignment(
            Long assignmentId, String tenantId) {

        EmployeeProject assignment =
                getAssignmentById(assignmentId, tenantId);

        if (!"ACTIVE".equals(assignment.getAssignmentStatus())) {
            throw new RuntimeException("Assignment is already closed");
        }

        assignment.setEndDate(LocalDate.now());
        assignment.setAssignmentStatus("CLOSED");

        return assignmentRepository.save(assignment);
    }

    @Override
    public List<EmployeeProject> getCurrentAssignments(
            Long employeeId, String tenantId) {

        return assignmentRepository
                .findByEmployeeIdAndTenantIdAndAssignmentStatus(
                        employeeId, tenantId, "ACTIVE");
    }

    @Override
    public List<EmployeeProject> getAssignmentHistory(
            Long employeeId, String tenantId) {

        return assignmentRepository
                .findByEmployeeIdAndTenantId(employeeId, tenantId);
    }

    private EmployeeProject getAssignmentById(
            Long assignmentId, String tenantId) {

        EmployeeProject assignment =
                assignmentRepository.findById(assignmentId)
                        .orElseThrow(() ->
                                new RuntimeException("Assignment not found"));

        if (!tenantId.equals(assignment.getTenantId())) {
            throw new RuntimeException("Assignment not found");
        }

        return assignment;
    }
}
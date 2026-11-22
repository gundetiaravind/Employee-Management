
package com.ems.project.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.company.repository.EmployeeRepository;
import com.ems.project.dto.AssignProjectRequest;
import com.ems.project.dto.EmployeeProjectResponse;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.entity.Project;
import com.ems.project.mapper.EmployeeProjectMapper;
import com.ems.project.repository.EmployeeProjectRepository;
import com.ems.project.repository.ProjectRepository;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeProjectServiceImpl implements EmployeeProjectService {

    private final EmployeeProjectRepository employeeProjectRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeProjectMapper employeeProjectMapper;
    private final UserRepository userRepository;
    private final EmployeeRepository companyEmployeeRepository;

    // Get authenticated user
    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new AccessDeniedException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AccessDeniedException("User account not found"));
    }

    // Get company tenant ID
    private String getTenantId(User user) {

        if (user.getCompany() == null) {
            throw new AccessDeniedException(
                    "User is not associated with a company");
        }

        String tenantId = user.getCompany().getCompanyCode();

        if (tenantId == null || tenantId.isBlank()) {
            throw new AccessDeniedException(
                    "Company tenant ID is missing");
        }

        return tenantId;
    }

    // Validate employee belongs to the logged-in Admin's company
    private void validateEmployeeBelongsToCompany(
            Long employeeId, Long companyId) {

        if (employeeId == null
                || companyEmployeeRepository
                        .findByIdAndCompanyId(employeeId, companyId)
                        .isEmpty()) {

            throw new EntityNotFoundException(
                    "Employee not found in your company");
        }
    }

    // Validate reporting manager belongs to the same company
    private void validateReportingManagerBelongsToCompany(
            Long companyId, String employeeCode, String email) {

        if (employeeCode == null || employeeCode.isBlank()
                || email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Reporting manager employee code and email are required");
        }

        boolean managerExists = companyEmployeeRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .anyMatch(employee ->
                        employeeCode.equals(employee.getEmploymentCode())
                        && email.equalsIgnoreCase(employee.getCompanyEmail()));

        if (!managerExists) {
            throw new EntityNotFoundException(
                    "Reporting manager not found in your company");
        }
    }

    // Find project using its code within the company
    private Project findProjectByCode(
            String projectCode, String tenantId) {

        return projectRepository.findAllByTenantId(tenantId)
                .stream()
                .filter(project ->
                        project.getProjectCode().equals(projectCode))
                .findFirst()
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Project not found: " + projectCode));
    }

    // Find project using ID and tenant ID
    private Project findProjectById(
            Long projectId, String tenantId) {

        return projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found"));
    }

    // Find assignment belonging to the company
    private EmployeeProject findAssignment(
            Long id, String tenantId) {

        return employeeProjectRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Assignment not found"));
    }

    // Validate assignment dates
    private void validateDates(
            LocalDate startDate, LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Project start date and end date are required");
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "Project end date cannot be before start date");
        }
    }

    // Assign employee to project
    @Override
    public EmployeeProjectResponse assignEmployeeToProject(
            AssignProjectRequest request) {

        User user = getAuthenticatedUser();
        String tenantId = getTenantId(user);
        Long companyId = user.getCompany().getId();

        validateDates(
                request.getProjectStartDate(),
                request.getProjectEndDate());

        validateEmployeeBelongsToCompany(
                request.getEmployeeId(), companyId);

        validateReportingManagerBelongsToCompany(
                companyId,
                request.getReportingManagerEmployeeCode(),
                request.getReportingManagerEmail());

        Project project = findProjectByCode(
                request.getProjectCode(), tenantId);

        EmployeeProject assignment = new EmployeeProject();

        assignment.setAssignmentStatus("ACTIVE");
        assignment.setEmployeeId(request.getEmployeeId());
        assignment.setProjectId(project.getId());
        assignment.setProjectStartDate(request.getProjectStartDate());
        assignment.setProjectEndDate(request.getProjectEndDate());

        assignment.setReportingManagerEmployeeCode(
                request.getReportingManagerEmployeeCode());

        assignment.setReportingManagerEmail(
                request.getReportingManagerEmail());

        assignment.setTenantId(tenantId);

        EmployeeProject savedAssignment =
                employeeProjectRepository.save(assignment);

        return employeeProjectMapper.toResponse(savedAssignment, project);
    }

    // Get all company assignments
    @Override
    @Transactional(readOnly = true)
    public List<EmployeeProjectResponse> getAllAssignments() {

        String tenantId = getTenantId(getAuthenticatedUser());

        return employeeProjectRepository.findAllByTenantId(tenantId)
                .stream()
                .map(assignment -> {
                    Project project = findProjectById(
                            assignment.getProjectId(), tenantId);

                    return employeeProjectMapper.toResponse(
                            assignment, project);
                })
                .toList();
    }

    // Get assignments by employee ID
    @Override
    @Transactional(readOnly = true)
    public List<EmployeeProjectResponse> getAssignmentsByEmployeeId(
            Long employeeId) {

        String tenantId = getTenantId(getAuthenticatedUser());

        return employeeProjectRepository
                .findAllByEmployeeIdAndTenantId(employeeId, tenantId)
                .stream()
                .map(assignment -> {
                    Project project = findProjectById(
                            assignment.getProjectId(), tenantId);

                    return employeeProjectMapper.toResponse(
                            assignment, project);
                })
                .toList();
    }

    // Get assignments by project ID
    @Override
    @Transactional(readOnly = true)
    public List<EmployeeProjectResponse> getAssignmentsByProjectId(
            Long projectId) {

        String tenantId = getTenantId(getAuthenticatedUser());

        findProjectById(projectId, tenantId);

        return employeeProjectRepository
                .findAllByProjectIdAndTenantId(projectId, tenantId)
                .stream()
                .map(assignment -> {
                    Project project = findProjectById(
                            assignment.getProjectId(), tenantId);

                    return employeeProjectMapper.toResponse(
                            assignment, project);
                })
                .toList();
    }

    // Get assignment by ID
    @Override
    @Transactional(readOnly = true)
    public EmployeeProjectResponse getAssignmentById(Long id) {

        String tenantId = getTenantId(getAuthenticatedUser());

        EmployeeProject assignment = findAssignment(id, tenantId);

        Project project = findProjectById(
                assignment.getProjectId(), tenantId);

        return employeeProjectMapper.toResponse(assignment, project);
    }

    // Update existing assignment
    @Override
    public EmployeeProjectResponse updateAssignment(
            Long id, AssignProjectRequest request) {

        User user = getAuthenticatedUser();
        String tenantId = getTenantId(user);
        Long companyId = user.getCompany().getId();

        EmployeeProject assignment = findAssignment(id, tenantId);

        validateDates(
                request.getProjectStartDate(),
                request.getProjectEndDate());

        validateEmployeeBelongsToCompany(
                request.getEmployeeId(), companyId);

        validateReportingManagerBelongsToCompany(
                companyId,
                request.getReportingManagerEmployeeCode(),
                request.getReportingManagerEmail());

        Project project = findProjectByCode(
                request.getProjectCode(), tenantId);

        assignment.setEmployeeId(request.getEmployeeId());
        assignment.setProjectId(project.getId());
        assignment.setProjectStartDate(request.getProjectStartDate());
        assignment.setProjectEndDate(request.getProjectEndDate());

        assignment.setReportingManagerEmployeeCode(
                request.getReportingManagerEmployeeCode());

        assignment.setReportingManagerEmail(
                request.getReportingManagerEmail());

        EmployeeProject updatedAssignment =
                employeeProjectRepository.save(assignment);

        return employeeProjectMapper.toResponse(
                updatedAssignment, project);
    }

    // Close assignment
    @Override
    public EmployeeProjectResponse closeAssignment(Long id) {

        String tenantId = getTenantId(getAuthenticatedUser());

        EmployeeProject assignment = findAssignment(id, tenantId);

        if ("CLOSED".equalsIgnoreCase(assignment.getAssignmentStatus())) {
            throw new IllegalStateException(
                    "Assignment is already closed");
        }

        LocalDate today = LocalDate.now();

        if (assignment.getProjectStartDate() == null) {
            throw new IllegalArgumentException(
                    "Assignment start date is missing");
        }

        if (today.isBefore(assignment.getProjectStartDate())) {
            throw new IllegalArgumentException(
                    "A future assignment cannot be closed before it starts");
        }

        if (assignment.getProjectEndDate() != null
                && assignment.getProjectEndDate().isBefore(today)) {

            throw new IllegalStateException(
                    "Assignment has already ended");
        }

        assignment.setProjectEndDate(today);
        assignment.setAssignmentStatus("CLOSED");

        EmployeeProject updatedAssignment =
                employeeProjectRepository.save(assignment);

        Project project = findProjectById(
                updatedAssignment.getProjectId(), tenantId);

        return employeeProjectMapper.toResponse(
                updatedAssignment, project);
    }
}

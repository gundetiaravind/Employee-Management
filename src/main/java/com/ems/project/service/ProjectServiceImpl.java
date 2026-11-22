
package com.ems.project.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.project.dto.ProjectRequest;
import com.ems.project.dto.ProjectResponse;
import com.ems.project.entity.Project;
import com.ems.project.mapper.ProjectMapper;
import com.ems.project.repository.ProjectRepository;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final UserRepository userRepository;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectMapper projectMapper,
            UserRepository userRepository) {

        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.userRepository = userRepository;
    }

    // Retrieve tenant ID from the authenticated user's company
    private String getCurrentTenantId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new AccessDeniedException(
                    "User is not authenticated.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Authenticated user not found."));

        if (user.getCompany() == null) {
            throw new AccessDeniedException(
                    "User is not associated with any company.");
        }

        String tenantId = user.getCompany().getCompanyCode();

        if (tenantId == null || tenantId.isBlank()) {
            throw new AccessDeniedException(
                    "User's company does not have a valid company code.");
        }

        return tenantId;
    }

    @Override
    public ProjectResponse createProject(ProjectRequest request) {

        validateDates(request);

        String tenantId = getCurrentTenantId();

        if (projectRepository.existsByProjectCodeAndTenantId(
                request.getProjectCode(), tenantId)) {

            throw new IllegalArgumentException(
                    "Project code already exists in this company.");
        }

        Project project = projectMapper.toEntity(request);

        // Tenant ID comes from the authenticated user's company.
        project.setTenantId(tenantId);

        Project savedProject = projectRepository.save(project);

        return projectMapper.toResponse(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {

        String tenantId = getCurrentTenantId();

        return projectRepository.findAllByTenantId(tenantId)
                .stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {

        String tenantId = getCurrentTenantId();

        Project project = projectRepository
                .findByIdAndTenantId(id, tenantId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Project not found."));

        return projectMapper.toResponse(project);
    }

    @Override
    public ProjectResponse updateProject(
            Long id, ProjectRequest request) {

        validateDates(request);

        String tenantId = getCurrentTenantId();

        Project existingProject = projectRepository
                .findByIdAndTenantId(id, tenantId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Project not found."));

        if (!existingProject.getProjectCode().equals(
                request.getProjectCode())
                && projectRepository.existsByProjectCodeAndTenantId(
                        request.getProjectCode(), tenantId)) {

            throw new IllegalArgumentException(
                    "Project code already exists in this company.");
        }

        // Update permitted project fields.
        existingProject.setProjectCode(request.getProjectCode());
        existingProject.setProjectName(request.getProjectName());
        existingProject.setDescription(request.getDescription());
        existingProject.setStartDate(request.getStartDate());
        existingProject.setEndDate(request.getEndDate());

        // Preserve existing status if no new status is provided.
        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            existingProject.setStatus(request.getStatus());
        }

        Project updatedProject =
                projectRepository.save(existingProject);

        return projectMapper.toResponse(updatedProject);
    }

    private void validateDates(ProjectRequest request) {

        if (request.getStartDate() != null
                && request.getEndDate() != null
                && request.getEndDate().isBefore(
                        request.getStartDate())) {

            throw new IllegalArgumentException(
                    "Project end date cannot be earlier than start date.");
        }
    }
}

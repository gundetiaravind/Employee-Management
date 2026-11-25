package com.ems.employee.service.impl;

import com.ems.employee.dto.WorkTaskResponse;
import com.ems.employee.mapper.WorkTaskMapper;
import com.ems.employee.service.WorkTaskService;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.entity.Project;
import com.ems.project.repository.EmployeeProjectRepository;
import com.ems.project.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WorkTaskServiceImpl implements WorkTaskService {

    private final EmployeeProjectRepository employeeProjectRepository;
    private final ProjectRepository projectRepository;
    private final WorkTaskMapper workTaskMapper;

    public WorkTaskServiceImpl(
            EmployeeProjectRepository employeeProjectRepository,
            ProjectRepository projectRepository,
            WorkTaskMapper workTaskMapper) {

        this.employeeProjectRepository = employeeProjectRepository;
        this.projectRepository = projectRepository;
        this.workTaskMapper = workTaskMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkTaskResponse> getMyWorkTasks(Long employeeId) {

        List<EmployeeProject> employeeProjects =
                employeeProjectRepository.findByEmployeeId(employeeId);

        return employeeProjects.stream()
                .map(employeeProject -> {

                    Project project = projectRepository
                            .findById(employeeProject.getProjectId())
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Project not found with id: "
                                            + employeeProject.getProjectId()));

                    return workTaskMapper.toResponse(
                            employeeProject,
                            project);
                })
                .toList();
    }

    @Override
    @Transactional
    public WorkTaskResponse updateStatus(
            Long employeeId, Long taskId, String status) {

        EmployeeProject employeeProject = employeeProjectRepository
                .findByIdAndEmployeeId(taskId, employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Work task not found"));

        employeeProject.setWorkStatus(status);
        EmployeeProject updatedAssignment =
                employeeProjectRepository.save(employeeProject);

        Project project = projectRepository
                .findById(updatedAssignment.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found with id: "
                                + updatedAssignment.getProjectId()));

        return workTaskMapper.toResponse(updatedAssignment, project);
    }
}
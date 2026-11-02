
package com.ems.project.service;

import java.util.List;

import com.ems.project.entity.Project;

public interface ProjectService {

    Project createProject(Project project, String tenantId);

    List<Project> getAllProjects(String tenantId);

    Project getProjectById(Long projectId, String tenantId);

    Project updateProject(
            Long projectId, Project updatedProject, String tenantId);

    void deleteProject(Long projectId, String tenantId);
}

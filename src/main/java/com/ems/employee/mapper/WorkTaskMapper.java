package com.ems.employee.mapper;

import com.ems.employee.dto.WorkTaskResponse;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.entity.Project;

import org.springframework.stereotype.Component;

@Component
public class WorkTaskMapper {

    public WorkTaskResponse toResponse(
            EmployeeProject employeeProject,
            Project project) {

        if (employeeProject == null) {
            return null;
        }

        return new WorkTaskResponse(
                employeeProject.getId(),                         // id
                employeeProject.getEmployeeId(),                 // employeeId
                project != null ? project.getProjectName() : null, // title
                project != null ? project.getDescription() : null, // description
                project != null ? project.getProjectName() : null, // project
                project != null ? project.getReportingManagerEmail() : null,//// assignedBy

                employeeProject.getStartDate(),           // assignedDate
                employeeProject.getEndDate(),             // dueDate
                project.getProjectPriority(),                    // priority
                employeeProject.getWorkStatus() != null
                        ? employeeProject.getWorkStatus()
                        : "Pending"                               // status
        );
    }
}
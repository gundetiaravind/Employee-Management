
package com.ems.employee.service.impl;

import com.ems.employee.dto.EmployeeProfileResponse;
import com.ems.employee.entity.Employee;
import com.ems.employee.mapper.EmployeeMapper;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.employee.service.EmployeeService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public EmployeeProfileResponse getMyProfile(String email) {

        // Find the authenticated user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the employee profile linked to that user
        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        return employeeMapper.toProfileResponse(employee);
    }
}

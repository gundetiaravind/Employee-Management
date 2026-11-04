package com.ems.user.service;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.entity.Company;
import com.ems.user.entity.User;

public interface UserAccountService {

    User createUserAccount(
            String fullName,
            String email,
            String password,
            String mobileNumber,
            Role role,
            UserStatus accountStatus,
            boolean emailVerified,
            Company company
    );
}
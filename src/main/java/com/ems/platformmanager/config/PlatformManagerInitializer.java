
package com.ems.platformmanager.config;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.notification.service.EmailService;
import com.ems.user.repository.UserRepository;
import com.ems.user.service.UserAccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlatformManagerInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserAccountService userAccountService;
    private final EmailService emailService;

    @Value("${platform.manager.email}")
    private String managerEmail;

    @Value("${platform.manager.name:Platform Manager}")
    private String managerName;

    @Value("${platform.manager.password}")
    private String managerPassword;

    @Value("${platform.manager.mobile-number:}")
    private String mobileNumber;

    @Override
    public void run(ApplicationArguments args) {

        String email = managerEmail.trim().toLowerCase();

        // Check whether an account with this email already exists
        if (userRepository.existsByEmail(email)) {
            log.info("Account already exists for: {}", email);
            return;
        }

        // Create Platform Manager account
        userAccountService.createUserAccount(
                managerName,
                email,
                managerPassword,
                mobileNumber,
                Role.PLATFORM_MANAGER,
                UserStatus.ACTIVE,
                true,
                null
        );

        // Send login credentials through email
        try {

            String subject = "OrgConnect - Platform Manager Account";

            String body = """
                    Hello %s,

                    Your OrgConnect Platform Manager account has been created successfully.

                    Login Details:

                    Email: %s
                    Password: %s

                    Login URL: http://localhost:5173

                    Please log in and change your password after your first login.

                    Regards,
                    OrgConnect Team
                    """.formatted(managerName, email, managerPassword);

            emailService.sendSimpleEmail(email, subject, body);

            log.info("Platform Manager account created and credentials emailed.");

        } catch (Exception exception) {
            log.error(
                    "Platform Manager account was created, but email delivery failed.",
                    exception
            );
        }
    }
}

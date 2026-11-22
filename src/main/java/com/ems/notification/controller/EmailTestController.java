
package com.ems.notification.controller;

import com.ems.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/email")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to) {

        emailService.sendSimpleEmail(
                to,
                "OrgConnect Email Test",
                "Congratulations! Your OrgConnect email service is working successfully."
        );

        return ResponseEntity.ok("Test email sent successfully.");
    }
}

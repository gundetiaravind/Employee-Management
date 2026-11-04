package com.ems.company.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class CompanyLogoConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String directory = Paths.get(
                "uploads",
                "company-logos"
        ).toAbsolutePath().normalize().toUri().toString();

        if (!directory.endsWith("/")) {
            directory += "/";
        }

        registry.addResourceHandler("/uploads/company-logos/**")
                .addResourceLocations(directory);
    }
}
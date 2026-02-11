package edu.kh.goodsugar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileConfig implements WebMvcConfigurer {

    @Value("${my.profile.resource-handler}")
    private String profileHandler;

    @Value("${my.profile.resource-location}")
    private String profileLocation;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(profileHandler)
                .addResourceLocations(profileLocation);
    }
}

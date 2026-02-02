package edu.kh.eightgyosi.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.MultipartConfigElement;

@Configuration
@PropertySource("classpath:/config.properties")
public class FileConfig implements WebMvcConfigurer {

    // ==================== 업로드 설정 ====================
    @Value("${spring.servlet.multipart.file-size-threshold}")
    private long fileSizeThreshold;

    @Value("${spring.servlet.multipart.location}")
    private String location;

    @Value("${spring.servlet.multipart.max-request-size}")
    private long maxRequestSize;

    @Value("${spring.servlet.multipart.max-file-size}")
    private long maxFileSize;

//  ==================== 프로필 이미지 관련 경로 ====================
    @Value("${my.profile.resource-handler}")
    private String profileResourceHandler; 
    // /myPage/profile/**

    @Value("${my.profile.resource-location}")
    private String profileResourceLocation;
    // file:///C:/uploadFiles/profile/

    @Value("${my.board.resource-handler}")
    private String boardResourceHandler;

    @Value("${my.board.resource-location}")
    private String boardResourceLocation;

    // ==================== ResourceHandler 설정 ====================
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/myPage/file/**")
                .addResourceLocations("file:///C:/uploadFiles/test/");

        registry.addResourceHandler(profileResourceHandler)
                .addResourceLocations(profileResourceLocation);
        // -> 클라이언트가 /myPage/profile/** 패턴으로 이미지 요청할 때
        // 서버 폴더 경로 중 C:/uploadFiles/profile/로 연결

        registry.addResourceHandler(boardResourceHandler)
                .addResourceLocations(boardResourceLocation);
    }

    // ==================== Multipart 설정 ====================
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setFileSizeThreshold(DataSize.ofBytes(fileSizeThreshold));
        factory.setLocation(location);
        factory.setMaxRequestSize(DataSize.ofBytes(maxRequestSize));
        factory.setMaxFileSize(DataSize.ofBytes(maxFileSize));
        return factory.createMultipartConfig();
    }

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    // ==================== Getter 추가 ====================
    public String getBoardResourceHandler() {
        return boardResourceHandler;
    }

    public String getBoardResourceLocation() {
        return boardResourceLocation;
    }

    public String getProfileResourceHandler() {
        return profileResourceHandler;
    }

    public String getProfileResourceLocation() {
        return profileResourceLocation;
    }

    public long getFileSizeThreshold() {
        return fileSizeThreshold;
    }

    public String getLocation() {
        return location;
    }

    public long getMaxRequestSize() {
        return maxRequestSize;
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    @Value("${my.board.web-path}")
    private String boardWebPath;

    @Value("${my.board.folder-path}")
    private String boardFolderPath;

    public String getBoardWebPath() {
        return boardWebPath;
    }

    public String getBoardFolderPath() {
        return boardFolderPath;
    }
}

//boardPrjoect에 양식에서 getter추가함

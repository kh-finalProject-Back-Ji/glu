package edu.kh.eightgyosi.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import edu.kh.eightgyosi.board.model.service.EditBoardService;
import edu.kh.eightgyosi.common.interceptor.BoardTypeInterceptor;
import edu.kh.eightgyosi.common.interceptor.QuotesFontInterceptor;
import lombok.RequiredArgsConstructor;

/**
 * WebConfig
 * - Interceptor 등록
 * - editBoard 관련 요청을 BoardTypeInterceptor로 가로채 권한 체크
 */
@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {

    private final EditBoardService editBoardService;

    @Bean
    public QuotesFontInterceptor quotesFontInterceptor() {
    	return new QuotesFontInterceptor();
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new BoardTypeInterceptor(editBoardService))
                .addPathPatterns("/**") 
                .excludePathPatterns("/css/**", "/js/**", "/images/**", "/favicon.ico",
                					"/myPage/**"); // 정적 리소스 제외

        
        registry
        .addInterceptor(quotesFontInterceptor())
        .addPathPatterns("/myPage/**")
        .excludePathPatterns("/favicon.ico");
    
    }
    
   
    
    
	
}
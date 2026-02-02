package edu.kh.eightgyosi.common.config;


import java.util.Arrays;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import edu.kh.eightgyosi.common.filter.LoginFilter;

// 로그인된 회원만 접근할 수 있는 경로 지정하는 Filter Config
@Configuration
public class FilterConfig {

	@Bean
	public FilterRegistrationBean<LoginFilter> loginFilter(){
		
		FilterRegistrationBean<LoginFilter> filter 
		= new FilterRegistrationBean<>();
		
		// 사용할 필터 객체 세팅
		filter.setFilter(new LoginFilter());
		
		// 필터가 동작할 URL 세팅
		// chatting, editBoard 추가 : daosl
		String[] filteringURL = {"/myPage/*", "/editBoard/*"};
		
		filter.setUrlPatterns(Arrays.asList(filteringURL));
		
		// 필터 이름 지정
		filter.setName("loginFilteR");
		
		// 필터 순서 지정
		filter.setOrder(1);
		
		return filter; // 반환된 객체가 Bean 등록
	};
		
}

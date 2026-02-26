package edu.kh.goodsugar.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    /**
     * 예)
     * app.cors.allowed-origins=https://goodsugar.store,https://www.goodsugar.store
     * 또는
     * app.cors.allowed-origins=https://www.goodsugar.store
     */
    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration cfg = new CorsConfiguration();

        // ✅ 콤마로 여러 개 들어올 수 있으니 split
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        // origins가 비어있으면(설정 누락) CORS 자체가 막혀버리니 로그 찍고 최소한 localhost라도 허용하는 방법도 있음
        // 여기서는 "prod에선 반드시 값 넣기" 전제로 그냥 세팅
        cfg.setAllowedOrigins(origins);

        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 헤더는 편하게 전체 허용 (Authorization 포함)
        cfg.setAllowedHeaders(List.of("*"));

        // 프론트에서 읽어야 하는 헤더가 있으면 노출
        cfg.setExposedHeaders(List.of("Set-Cookie"));

        // ✅ 쿠키(Refresh Token) 전송 필수
        cfg.setAllowCredentials(true);

        // 캐시
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
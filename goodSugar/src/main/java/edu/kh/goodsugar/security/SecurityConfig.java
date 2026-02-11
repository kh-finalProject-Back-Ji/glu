package edu.kh.goodsugar.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final JwtAuthFilter jwtAuthFilter;
    private final OAuthMemberService oAuthMemberService;

    @Value("${app.oauth2.frontend-redirect}")
    private String frontendRedirect;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // 🔥 CSRF 비활성 (JWT 사용)
        http.csrf(csrf -> csrf.disable());

        // 🔥 CORS 활성
        http.cors(Customizer.withDefaults());

        // 🔥 세션 사용 안함 (JWT 기반)
        http.sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 🔥 예외 처리
        http.exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> res.sendError(401))
                .accessDeniedHandler((req, res, ex) -> res.sendError(403))
        );

        // 🔥 URL 권한 설정
        http.authorizeHttpRequests(auth -> auth

                // preflight 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 공개 API
                .requestMatchers(
                        "/",
                        "/error",
                        "/oauth2/**",
                        "/login/**",
                        "/api/auth/refresh",
                        "/api/auth/logout",
                        "/api/foods/**",
                        "/myPage/profile/**",
                        "/api/member/login",
                        "/api/member/signup",
                        "/api/member/email/**",
                        "/api/member/nickname/**",
                        "/api/member/email/exists",
                        "/api/member/nickname/exists"
                ).permitAll()

                .anyRequest().authenticated()
        );

        // 🔥 OAuth2 로그인 성공 시 JWT 발급
        http.oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo ->
                        userInfo.userService(oAuthMemberService)
                )
                .successHandler((request, response, authentication) -> {

                    var token =
                            (org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) authentication;

                    var oAuthUser =
                            (org.springframework.security.oauth2.core.user.OAuth2User) token.getPrincipal();

                    Long memberId = (Long) oAuthUser.getAttribute("memberId");
                    String email = (String) oAuthUser.getAttribute("email");

                    if (email == null) {
                        email = "unknown@local";
                    }

                    String access = jwtProvider.createAccessToken(memberId, email);
                    String refresh = jwtProvider.createRefreshToken(memberId);

                    // 🔥 운영용 refresh 쿠키
                    ResponseCookie cookie = ResponseCookie.from("refresh_token", refresh)
                            .httpOnly(true)
                            .secure(false)          // ✅ 운영 HTTPS 필수
                            .sameSite("Lax")      // ✅ cross-site 허용
                            .path("/")
                            .maxAge(60 * 60 * 24 * 14)
                            .build();

                    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                    // access는 프론트로 전달
                    String redirect = UriComponentsBuilder
                            .fromUriString(frontendRedirect)
                            .queryParam("access", access)
                            .build()
                            .toUriString();

                    response.sendRedirect(redirect);
                })
                .failureHandler((request, response, exception) -> {
                    response.sendError(401);
                })
        );

        // 🔥 formLogin 비활성
        http.formLogin(form -> form.disable());

        // 🔥 JWT 필터 등록
        http.addFilterBefore(jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    
    
}


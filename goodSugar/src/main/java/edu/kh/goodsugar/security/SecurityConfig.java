package edu.kh.goodsugar.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final OAuthMemberService oAuthMemberService;
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.oauth2.frontend-redirect}")
    private String frontendRedirect;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());

        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> res.sendError(401))
                .accessDeniedHandler((req, res, ex) -> res.sendError(403))
        );

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/", "/oauth2/**", "/login/**", "/error",
                        "/api/auth/refresh", "/api/auth/logout",

                        // ✅ 식품 검색/상세는 로그인 없이 공개
                        "/api/foods/**",

                        // ✅ 너가 통째로 열어둔 경로
                        "/member/**"
                ).permitAll()
                .anyRequest().authenticated()
        );

        http.oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo.userService(oAuthMemberService))
                .successHandler((request, response, authentication) -> {

                    var token = (org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) authentication;
                    var oAuthUser = (org.springframework.security.oauth2.core.user.OAuth2User) token.getPrincipal();

                    Long memberId = (Long) oAuthUser.getAttribute("memberId");
                    String email = (String) oAuthUser.getAttribute("email");

                    if (email == null) {
                        String provider = (String) oAuthUser.getAttribute("provider");
                        String providerId = (String) oAuthUser.getAttribute("providerId");
                        email = provider + "_" + providerId + "@no-email.local";
                    }

                    String access = jwtProvider.createAccessToken(memberId, email);
                    String refresh = jwtProvider.createRefreshToken(memberId);

                    Cookie cookie = new Cookie("refresh_token", refresh);
                    cookie.setHttpOnly(true);
                    cookie.setSecure(false);
                    cookie.setPath("/");
                    cookie.setMaxAge(60 * 60 * 24 * 14);
                    response.addCookie(cookie);

                    String redirect = UriComponentsBuilder
                            .fromUriString(frontendRedirect)
                            .queryParam("access", access)
                            .build()
                            .toUriString();

                    response.sendRedirect(redirect);
                })
                .failureHandler((request, response, exception) -> {
                    exception.printStackTrace();
                    String redirect = UriComponentsBuilder
                            .fromUriString(frontendRedirect)
                            .queryParam("error", "OAUTH_FAIL")
                            .build()
                            .toUriString();
                    response.sendRedirect(redirect);
                })
        );

        http.formLogin(form -> form.disable());

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
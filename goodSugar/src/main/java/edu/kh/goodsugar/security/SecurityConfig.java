package edu.kh.goodsugar.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final OAuthMemberService oAuthMemberService;
    private final JwtAuthFilter jwtAuthFilter;
    private final ClientRegistrationRepository clientRegistrationRepository;

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
                        "/member/**",
                        "/board/**"
                ).permitAll()
                .anyRequest().authenticated()
        );

        http.oauth2Login(oauth -> oauth
                // ✅ 여기서 PKCE 제거 resolver 적용
                .authorizationEndpoint(a -> a.authorizationRequestResolver(kakaoPkceOffResolver()))
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

    /**
     * ✅ 카카오 authorize 요청에서 PKCE(code_challenge...) 제거
     */
    @Bean
    public OAuth2AuthorizationRequestResolver kakaoPkceOffResolver() {
        DefaultOAuth2AuthorizationRequestResolver delegate =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");

        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                return customize(delegate.resolve(request), null);
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                return customize(delegate.resolve(request, clientRegistrationId), clientRegistrationId);
            }

            private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest req, String id) {
                if (req == null) return null;

                // ✅ kakao일 때만 PKCE 파라미터 제거
                if ("kakao".equals(id) || req.getAuthorizationRequestUri().contains("kauth.kakao.com")) {
                    var extra = new HashMap<>(req.getAdditionalParameters());
                    extra.remove("code_challenge");
                    extra.remove("code_challenge_method");

                    // (보험) attributes에 code_verifier 같은 게 남는 경우도 있으니 같이 정리
                    var attrs = new HashMap<>(req.getAttributes());
                    attrs.remove("code_verifier");

                    return OAuth2AuthorizationRequest.from(req)
                            .additionalParameters(extra)
                            .attributes(attrs)
                            .build();
                }

                return req;
            }
        };
    }
}



package edu.kh.goodsugar.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();

        // ✅ 공개 API는 JWT 검사 스킵 (검색/상세)
        if (uri.startsWith("/api/foods")) {
            filterChain.doFilter(request, response);
            return;
        }

        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);

            try {
                Claims claims = jwtProvider.parse(token);

                // access 토큰만 허용
                Object type = claims.get("type");
                if (type != null && !"access".equals(type.toString())) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String memberId = claims.getSubject(); // createAccessToken에서 memberId를 subject로 넣었다고 가정
                if (memberId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    var authToken = new UsernamePasswordAuthenticationToken(
                            memberId,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ignore) {
                // 토큰 파싱 실패 시 그냥 통과 -> 이후 Security가 401 처리
            }
        }

        filterChain.doFilter(request, response);
    }
}



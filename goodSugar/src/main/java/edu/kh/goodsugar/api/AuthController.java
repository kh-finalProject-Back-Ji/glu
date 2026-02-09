package edu.kh.goodsugar.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.goodsugar.security.JwtProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtProvider jwtProvider;

    public AuthController(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refresh = getCookie(request, "refresh_token");
        if (refresh == null) return ResponseEntity.status(401).body("NO_REFRESH");

        try {
            Claims claims = jwtProvider.parse(refresh);
            if (!"refresh".equals(claims.get("type"))) {
                return ResponseEntity.status(401).body("BAD_REFRESH");
            }

            Long memberId = Long.valueOf(claims.getSubject());
            // refresh에는 email이 없으니 access에 email 넣고 싶으면 DB조회해서 넣어야 함.
            // 지금은 최소정보로 운용: email은 빈값/placeholder
            String access = jwtProvider.createAccessToken(memberId, "no-email.local");

            return ResponseEntity.ok(Map.of("access", access));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("EXPIRED_REFRESH");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body("NO_AUTH");
        return ResponseEntity.ok(Map.of("memberId", auth.getName()));
    }

    private String getCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
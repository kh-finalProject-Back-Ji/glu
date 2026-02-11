package edu.kh.goodsugar.api;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.security.JwtProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtProvider jwtProvider;

    // ============================
    // 🔄 Refresh Access Token
    // ============================
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "NO_REFRESH_TOKEN"));
        }

        try {
            Claims claims = jwtProvider.parse(refreshToken);

            Object type = claims.get("type");
            if (type == null || !"refresh".equals(type.toString())) {
                return ResponseEntity.status(401).body(Map.of("message", "INVALID_TOKEN_TYPE"));
            }

            Long memberId = Long.valueOf(claims.getSubject());

            // ⚠ 운영에서는 memberId로 DB 조회해서 email 넣는 게 정석
            String access = jwtProvider.createAccessToken(memberId, "no-email.local");

            return ResponseEntity.ok(Map.of("access", access));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "REFRESH_EXPIRED_OR_INVALID"));
        }
    }

    // ============================
    // 🚪 Logout (refresh 쿠키 삭제)
    // ============================
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)       // 🔥 운영 HTTPS 필수
                .sameSite("None")   // 🔥 cross-site면 None
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "LOGOUT_SUCCESS"));
    }

    // ============================
    // 👤 현재 사용자 확인
    // ============================
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("message", "NO_AUTH"));
        }

        return ResponseEntity.ok(Map.of("memberId", auth.getName()));
    }
}


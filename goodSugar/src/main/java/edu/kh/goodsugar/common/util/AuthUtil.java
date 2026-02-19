package edu.kh.goodsugar.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * AuthUtil
 * - JwtAuthFilter에서 principal/name에 memberId(String)를 넣는 구조 전용 유틸
 *
 * JwtAuthFilter:
 *   new UsernamePasswordAuthenticationToken(memberId, null, ROLE_USER)
 *
 * 따라서:
 *   auth.getPrincipal() -> "3"
 *   auth.getName()      -> "3"
 */
public final class AuthUtil {

    private AuthUtil() {}

    /**
     * SecurityContext에서 Authentication 꺼내서 memberId(Long) 반환
     * 로그인 안되어 있으면 null
     */
    public static Long getMemberId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return getMemberId(auth);
    }

    /**
     * Authentication에서 memberId(Long) 반환
     * 로그인 안되어 있으면 null
     */
    public static Long getMemberId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;

        // 너 구조에선 name이 memberId(String)
        Long fromName = parseLongOrNull(auth.getName());
        if (fromName != null) return fromName;

        // 혹시 principal로 넣는 경우도 안전하게 처리
        Object principal = auth.getPrincipal();
        if (principal instanceof String s) return parseLongOrNull(s);
        if (principal instanceof Long l) return l;
        if (principal instanceof Integer i) return i.longValue();

        return null;
    }

    /**
     * 로그인 필수 API에서 사용
     * memberId 없으면 RuntimeException 발생
     */
    public static long requireMemberId() {
        Long id = getMemberId();
        if (id == null) throw new RuntimeException("UNAUTHORIZED");
        return id;
    }

    /**
     * 로그인 필수 API에서 사용 (Authentication 직접 받을 때)
     */
    public static long requireMemberId(Authentication auth) {
        Long id = getMemberId(auth);
        if (id == null) throw new RuntimeException("UNAUTHORIZED");
        return id;
    }

    private static Long parseLongOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        if (t.isEmpty()) return null;
        try {
            return Long.parseLong(t);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

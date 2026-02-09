package edu.kh.goodsugar.security;

import java.util.Map;

import org.springframework.security.oauth2.core.user.OAuth2User;

public class OAuthProfileExtractor {

    public static OAuthProfile extract(String registrationId, OAuth2User user) {
        return switch (registrationId) {
            case "google" -> fromGoogle(user);
            case "kakao" -> fromKakao(user);
            case "naver" -> fromNaver(user);
            default -> throw new IllegalArgumentException("Unsupported provider: " + registrationId);
        };
    }

    private static OAuthProfile fromGoogle(OAuth2User user) {
        String sub = safeString(user.getAttribute("sub"));
        String email = safeString(user.getAttribute("email"));
        String name = safeString(user.getAttribute("name")); // nickname으로 사용

        return new OAuthProfile("google", sub, email, name);
    }

    @SuppressWarnings("unchecked")
    private static OAuthProfile fromKakao(OAuth2User user) {
        // 카카오는 id가 Long/Integer/String 등으로 올 수 있어서 안전 변환
        String id = safeString(user.getAttribute("id"));

        Map<String, Object> kakaoAccount = (Map<String, Object>) user.getAttribute("kakao_account");
        Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;

        String email = kakaoAccount != null ? safeString(kakaoAccount.get("email")) : null;
        String nickname = profile != null ? safeString(profile.get("nickname")) : null;

        return new OAuthProfile("kakao", id, email, nickname);
    }

    @SuppressWarnings("unchecked")
    private static OAuthProfile fromNaver(OAuth2User user) {
        Map<String, Object> resp = (Map<String, Object>) user.getAttribute("response");

        String id = resp != null ? safeString(resp.get("id")) : null;
        String email = resp != null ? safeString(resp.get("email")) : null;
        String name = resp != null ? safeString(resp.get("name")) : null; // nickname처럼 사용

        return new OAuthProfile("naver", id, email, name);
    }

    private static String safeString(Object v) {
        return v == null ? null : String.valueOf(v);
    }
}
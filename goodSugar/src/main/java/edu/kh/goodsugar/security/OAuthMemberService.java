package edu.kh.goodsugar.security;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.enums.LoginType;
import edu.kh.goodsugar.member.model.enums.MemberRole;
import edu.kh.goodsugar.member.model.enums.MemberStatus;
import edu.kh.goodsugar.member.model.enums.OAuthProvider;
import edu.kh.goodsugar.member.model.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuthMemberService extends DefaultOAuth2UserService {

    private final MemberMapper memberMapper;

    private static final SecureRandom RND = new SecureRandom();
    private static final String ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

    public record MemberInfo(Long memberId, String email) {}

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // google|kakao|naver
        OAuthProfile profile = OAuthProfileExtractor.extract(provider, oAuth2User);

        MemberInfo member = upsertFromOAuth(profile);

        Map<String, Object> attrs = new HashMap<>(oAuth2User.getAttributes());
        attrs.put("memberId", member.memberId());
        attrs.put("email", member.email());
        attrs.put("provider", provider);
        attrs.put("providerId", profile.providerId());

        return new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                attrs,
                "providerId"
        );
    }

    /**
     * ✅ OAuth 로그인/가입 통합 처리
     * - 식별은 (provider + providerId)로만
     * - 이메일은 있으면 사용, 없으면 fake email 발급
     * - 닉네임은 외부 제공 nickname 무시하고 "임시 닉네임"만 발급 (충돌 방지)
     */
    public MemberInfo upsertFromOAuth(OAuthProfile profile) {

        String providerUpper = profile.provider().toUpperCase(Locale.ROOT);

        // 1) 이미 가입된 OAuth 회원이면 그대로 로그인 처리
        Member found = memberMapper.selectByOAuth(providerUpper, profile.providerId());
        if (found != null) {
            memberMapper.updateLastLogin(found.getMemberId());
            return new MemberInfo(found.getMemberId(), found.getEmail());
        }

        OAuthProvider providerEnum = OAuthProvider.valueOf(providerUpper);

        // 2) EMAIL: 카카오 등 null 가능 + DB NOT NULL 대응
        String email = profile.email();
        if (email == null || email.isBlank()) {
            email = providerUpper.toLowerCase(Locale.ROOT) + "_" + shortUid(profile.providerId()) + "@no-email.local";
        } else {
            // 같은 이메일이 이미 존재하면 충돌 가능 → fake email로 회피
            if (memberMapper.existsEmail(email) > 0) {
                email = providerUpper.toLowerCase(Locale.ROOT) + "_" + shortUid(profile.providerId()) + "@no-email.local";
            }
        }

        // 3) NICKNAME: 외부 nickname은 무시하고 임시 닉네임 발급 (충돌 방지)
        // 예: kakao_1234abcd / naver_88aa11bb
        String baseTempNick = providerEnum.name().toLowerCase(Locale.ROOT) + "_" + shortUid(profile.providerId());
        String nickname = makeUniqueNickname(providerEnum, profile.providerId(), baseTempNick);

        // 4) 신규 회원 INSERT
        Member m = new Member();
        m.setEmail(email);
        m.setNickname(nickname);

        m.setLoginType(LoginType.OAUTH);
        m.setPasswordHash(null);

        m.setOauthProvider(providerEnum);
        m.setOauthUid(profile.providerId());

        // name도 임시 닉네임으로 통일 (외부 값 저장 안 함)
        m.setName(nickname);

        m.setStatus(MemberStatus.ACTIVE);
        m.setRole(MemberRole.USER);

        memberMapper.insertOAuthMember(m);

        // insertOAuthMember에서 selectKey로 memberId가 채워지는 구조여야 함
        return new MemberInfo(m.getMemberId(), m.getEmail());
    }

    /**
     * ✅ 닉네임을 DB에서 UNIQUE하게 보장
     * - candidate가 이미 있으면 뒤에 랜덤 suffix 붙임
     */
    private String makeUniqueNickname(OAuthProvider provider, String oauthUid, String baseCandidate) {

        String base = normalize(baseCandidate);

        if (base.length() < 3) base = "user_" + randomSuffix(6);
        if (base.length() > 20) base = base.substring(0, 20);

        String candidate = base;
        int guard = 0;

        while (memberMapper.existsNickname(candidate) > 0) {
            guard++;
            candidate = base + "_" + randomSuffix(4);

            if (candidate.length() > 50) candidate = candidate.substring(0, 50);

            if (guard > 50) {
                candidate = provider.name().toLowerCase(Locale.ROOT) + "_" + randomSuffix(10);
                break;
            }
        }
        return candidate;
    }

    private String normalize(String raw) {
        if (raw == null) return "user_" + randomSuffix(6);

        String s = raw.trim().toLowerCase(Locale.ROOT);
        s = s.replaceAll("[^a-z0-9_]", "_");
        s = s.replaceAll("_+", "_");
        if (s.startsWith("_")) s = s.substring(1);
        if (s.endsWith("_")) s = s.substring(0, s.length() - 1);
        return s.isBlank() ? "user_" + randomSuffix(6) : s;
    }

    private String shortUid(String uid) {
        if (uid == null) return randomSuffix(8);
        return uid.length() > 8 ? uid.substring(0, 8) : uid;
    }

    private String randomSuffix(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(ALPHANUM.charAt(RND.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
}


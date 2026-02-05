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

    public MemberInfo upsertFromOAuth(OAuthProfile profile) {

        String providerUpper = profile.provider().toUpperCase(Locale.ROOT);

        Member found = memberMapper.selectByOAuth(providerUpper, profile.providerId());
        if (found != null) {
            memberMapper.updateLastLogin(found.getMemberId());
            return new MemberInfo(found.getMemberId(), found.getEmail());
        }

        OAuthProvider providerEnum = OAuthProvider.valueOf(providerUpper);

        // ✅ EMAIL: 카카오 등 null 가능 + DB는 NOT NULL
        String email = profile.email();
        if (email == null || email.isBlank()) {
            // provider+uid 기반으로 “유니크한 가짜 이메일” 생성
            email = providerUpper.toLowerCase(Locale.ROOT) + "_" + shortUid(profile.providerId()) + "@no-email.local";
        } else {
            // 혹시 같은 이메일이 이미 LOCAL 회원으로 존재하면 충돌 가능 → fallback
            if (memberMapper.existsEmail(email) > 0) {
                email = providerUpper.toLowerCase(Locale.ROOT) + "_" + shortUid(profile.providerId()) + "@no-email.local";
            }
        }

        // ✅ NICKNAME: null/빈값이면 생성 + UNIQUE 보장
        String nickname = makeUniqueNickname(providerEnum, profile.providerId(), profile.nickname());

        Member m = new Member();
        m.setEmail(email);
        m.setNickname(nickname);

        m.setLoginType(LoginType.OAUTH);
        m.setPasswordHash(null);

        m.setOauthProvider(providerEnum);
        m.setOauthUid(profile.providerId());

        // name 없으면 nickname로 대체
        m.setName((profile.nickname() != null && !profile.nickname().isBlank()) ? profile.nickname() : nickname);

        m.setStatus(MemberStatus.ACTIVE);
        m.setRole(MemberRole.USER);

        memberMapper.insertOAuthMember(m);

        // ✅ 너 XML이 selectKey로 memberId 채우는 구조면 여기서 m.getMemberId()가 채워져야 정상
        // (안 채워지면 insertOAuthMember xml에 selectKey 확인)
        return new MemberInfo(m.getMemberId(), m.getEmail());
    }

    private String makeUniqueNickname(OAuthProvider provider, String oauthUid, String nickFromProvider) {

        String base;
        if (nickFromProvider != null && !nickFromProvider.isBlank()) {
            base = normalize(nickFromProvider);
        } else {
            base = provider.name().toLowerCase(Locale.ROOT) + "_" + shortUid(oauthUid);
        }

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


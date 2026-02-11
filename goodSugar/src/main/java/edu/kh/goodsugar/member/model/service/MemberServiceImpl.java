package edu.kh.goodsugar.member.model.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;
import edu.kh.goodsugar.member.model.enums.LoginType;
import edu.kh.goodsugar.member.model.enums.MemberRole;
import edu.kh.goodsugar.member.model.enums.MemberStatus;
import edu.kh.goodsugar.member.model.mapper.EmailVerifyMapper;
import edu.kh.goodsugar.member.model.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberMapper mapper;
    private final EmailVerifyMapper emailVerifyMapper;
    private final MailService mailService;

    // ✅ 추가
    private final PasswordEncoder passwordEncoder;

    @Override
    public boolean existsEmail(String email) {
        return mapper.existsEmail(email) > 0;
    }

    @Override
    public boolean existsNickname(String nickname) {
        return mapper.existsNickname(nickname) > 0;
    }

    @Override
    public void sendEmailVerifyCode(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("이메일을 입력하세요.");
        }
        if (existsEmail(email)) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        String code = String.valueOf((int) (Math.random() * 900000) + 100000);
        int minutes = 10;

        emailVerifyMapper.upsertCode(email, code, minutes);
        mailService.sendVerifyCode(email, code, minutes);
    }

    @Override
    public boolean verifyEmailCode(String email, String code) {
        if (email == null || email.isBlank()) return false;
        if (code == null || code.isBlank()) return false;
        return emailVerifyMapper.verify(email, code) == 1;
    }

    @Override
    public Member signup(SignupRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new RuntimeException("이메일을 입력하세요.");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("비밀번호를 입력하세요.");
        }
        if (req.getNickname() == null || req.getNickname().isBlank()) {
            throw new RuntimeException("닉네임을 입력하세요.");
        }

        if (existsNickname(req.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }
        if (existsEmail(req.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        if (emailVerifyMapper.isVerifiedValid(req.getEmail()) == 0) {
            throw new RuntimeException("이메일 인증이 필요합니다.");
        }

        // ✅ bcrypt 해시로 저장
        String hash = passwordEncoder.encode(req.getPassword());

        Member m = new Member();
        m.setEmail(req.getEmail());
        m.setNickname(req.getNickname());
        m.setLoginType(LoginType.LOCAL);
        m.setPasswordHash(hash);              // ✅ 여기!
        m.setName(req.getName());
        m.setGender(req.getGender());
        m.setMemberBirth(req.getMemberBirth());
        m.setStatus(MemberStatus.ACTIVE);
        m.setRole(MemberRole.USER);

        mapper.insertMember(m);
        return mapper.selectByEmail(req.getEmail());
    }

    @Override
    public Member login(LoginRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) return null;
        if (req.getPassword() == null || req.getPassword().isBlank()) return null;

        Member m = mapper.selectByEmail(req.getEmail());
        if (m == null) return null;

        String stored = m.getPasswordHash();
        if (stored == null || stored.isBlank()) return null;

        String rawPw = req.getPassword();

        // ✅ 1) 이미 bcrypt로 저장된 계정
        if (isBcrypt(stored)) {
            if (!passwordEncoder.matches(rawPw, stored)) return null;

            mapper.updateLastLogin(m.getMemberId());
            return m;
        }

        // ✅ 2) 예전 개발 평문 계정(호환): 평문 비교 후 bcrypt로 "1회" 업그레이드
        if (!stored.equals(rawPw)) return null;

        // 업그레이드: 다음부터는 bcrypt로만 검증됨
        String newHash = passwordEncoder.encode(rawPw);

        // ⚠️ mapper에 updatePasswordHash가 없으니,
        // 너는 가장 빠르게 해결하려면 MemberMapper에 update 쿼리 1개만 추가하면 됨 (아래에 제공)
        mapper.updatePasswordHash(m.getMemberId(), newHash);
        m.setPasswordHash(newHash);

        mapper.updateLastLogin(m.getMemberId());
        return m;
    }

    private boolean isBcrypt(String s) {
        return s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
    }

    @Override
    public Member getMe(Long memberId) {
        return mapper.selectMe(memberId);
    }

    @Override
    public Member updateMe(Long memberId, Member req) {
        Member update = new Member();
        update.setMemberId(memberId);

        update.setNickname(req.getNickname());
        update.setName(req.getName());
        update.setGender(req.getGender());
        update.setMemberBirth(req.getMemberBirth());
        update.setProfileImg(req.getProfileImg());

        mapper.updateMe(update);
        return mapper.selectMe(memberId);
    }

    @Override
    public Member updateProfileImg(Long memberId, String profileImg) {
        mapper.updateProfileImg(memberId, profileImg);
        return mapper.selectMe(memberId);
    }
}

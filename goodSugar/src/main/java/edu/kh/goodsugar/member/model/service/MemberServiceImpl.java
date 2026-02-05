package edu.kh.goodsugar.member.model.service;

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

        String code = String.valueOf((int)(Math.random() * 900000) + 100000);

        int minutes = 10;
        emailVerifyMapper.upsertCode(email, code, minutes);

        // ✅ 실제 메일 발송
        mailService.sendVerifyCode(email, code, minutes);

        // ❌ 이건 삭제
        // System.out.println("[DEV EMAIL CODE] " + email + " / " + code);
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

        // 닉네임 중복
        if (existsNickname(req.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        // 이메일 중복
        if (existsEmail(req.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 이메일 인증 완료(그리고 만료 안 됨) 강제
        if (emailVerifyMapper.isVerifiedValid(req.getEmail()) == 0) {
            throw new RuntimeException("이메일 인증이 필요합니다.");
        }

        // 가입
        Member m = new Member();
        m.setEmail(req.getEmail());
        m.setNickname(req.getNickname());
        m.setLoginType(LoginType.LOCAL);
        m.setPasswordHash(req.getPassword()); // TODO: BCrypt로 바꿔
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

        if (m.getPasswordHash() == null) return null;
        if (!m.getPasswordHash().equals(req.getPassword())) {
            return null;
        }

        mapper.updateLastLogin(m.getMemberId());
        return m;
    }
}

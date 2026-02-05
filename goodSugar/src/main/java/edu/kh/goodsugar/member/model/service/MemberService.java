package edu.kh.goodsugar.member.model.service;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;

public interface MemberService {

    Member signup(SignupRequest req);

    Member login(LoginRequest req);

    // 중복체크
    boolean existsEmail(String email);
    boolean existsNickname(String nickname);

    // 이메일 인증
    void sendEmailVerifyCode(String email);
    boolean verifyEmailCode(String email, String code);
}

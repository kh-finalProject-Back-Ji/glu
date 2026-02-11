package edu.kh.goodsugar.member.model.service;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;

public interface MemberService {

    Member signup(SignupRequest req);
    Member login(LoginRequest req);

    boolean existsEmail(String email);
    boolean existsNickname(String nickname);

    void sendEmailVerifyCode(String email);
    boolean verifyEmailCode(String email, String code);

    // JWT 기반 내정보
    Member getMe(Long memberId);
    Member updateMe(Long memberId, Member req);

    // ✅ 업로드 후 갱신된 Member 반환하도록!
    Member updateProfileImg(Long memberId, String profileImg);
}

package edu.kh.goodsugar.member.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import edu.kh.goodsugar.member.model.enums.LoginType;
import edu.kh.goodsugar.member.model.enums.MemberRole;
import edu.kh.goodsugar.member.model.enums.MemberStatus;
import edu.kh.goodsugar.member.model.enums.OAuthProvider;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    private Long memberId;

    private String email;

    private String nickname;

    private LoginType loginType;          // LOCAL / OAUTH
    private String passwordHash;          // LOCAL 로그인용 (암호화된 비번)

    private OAuthProvider oauthProvider;  // KAKAO / NAVER / GOOGLE
    private String oauthUid;

    private String name;
    private String gender;
    private LocalDate memberBirth;

    private String profileImg;

    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime withdrawAt;

    private MemberStatus status;          // ACTIVE / BLOCKED / WITHDRAW
    private MemberRole role;              // USER / ADMIN
}
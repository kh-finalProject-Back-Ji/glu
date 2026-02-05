package edu.kh.goodsugar.member.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerify {

    // 이메일 인증 요청 식별자(PK)
    private Long verifyId;

    // 인증 대상 회원(FK)
    private Long memberId;

    // 인증 대상 이메일
    private String email;

    // 인증코드
    private String verifyCode;

    // 인증 만료 시점
    private LocalDateTime expiredAt;

    // 인증 완료 시점 (미인증이면 null)
    private LocalDateTime verifiedAt;
}
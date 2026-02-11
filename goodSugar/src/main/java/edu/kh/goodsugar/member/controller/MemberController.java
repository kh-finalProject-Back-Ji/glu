package edu.kh.goodsugar.member.controller;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.EmailSendRequest;
import edu.kh.goodsugar.member.model.dto.request.EmailVerifyRequest;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;
import edu.kh.goodsugar.member.model.service.MemberService;
import edu.kh.goodsugar.security.JwtProvider;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/member") // ✅ /api로 통일 권장 (기존 /member 쓰고싶으면 그걸로 바꿔도 됨)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MemberController {

    private final MemberService service;
    private final JwtProvider jwtProvider;

    // ==========================
    // 1) 중복 체크
    // ==========================
    @GetMapping("/email/exists")
    public ResponseEntity<?> existsEmail(@RequestParam("email") String email) {
        boolean exists = service.existsEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/nickname/exists")
    public ResponseEntity<?> existsNickname(@RequestParam("nickname") String nickname) {
        boolean exists = service.existsNickname(nickname);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // ==========================
    // 2) 이메일 인증
    // ==========================
    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailCode(@RequestBody EmailSendRequest req) {
        service.sendEmailVerifyCode(req.getEmail());
        return ResponseEntity.ok(Map.of("sent", true));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmailCode(@RequestBody EmailVerifyRequest req) {
        boolean ok = service.verifyEmailCode(req.getEmail(), req.getCode());
        if (!ok) return ResponseEntity.status(400).body("INVALID_OR_EXPIRED_CODE");
        return ResponseEntity.ok(Map.of("verified", true));
    }

    // ==========================
    // 3) 회원가입
    // ==========================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        Member member = service.signup(req);
        return ResponseEntity.ok(member);
    }

    // ==========================
    // 4) JWT 로그인
    // ==========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        Member loginMember = service.login(req);

        if (loginMember == null) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 틀렸습니다.");
        }

        // ✅ accessToken 발급
        String accessToken = jwtProvider.createAccessToken(
                loginMember.getMemberId(),
                loginMember.getEmail()
        );

        return ResponseEntity.ok(Map.of(
                "member", loginMember,
                "accessToken", accessToken
        ));
    }

    // (선택) 로그아웃: 프론트에서 토큰 삭제하면 끝. refresh 쿠키 쓸거면 /api/auth/logout 같이 호출.
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("OK");
    }
}


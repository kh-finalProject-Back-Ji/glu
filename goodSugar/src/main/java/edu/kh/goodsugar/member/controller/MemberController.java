package edu.kh.goodsugar.member.controller;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.EmailSendRequest;
import edu.kh.goodsugar.member.model.dto.request.EmailVerifyRequest;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;
import edu.kh.goodsugar.member.model.service.MemberService;
import edu.kh.goodsugar.security.JwtProvider;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/member")
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
    // 4) 로그인 (LOCAL) -> JWT 통일
    // ==========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {

        Member loginMember = service.login(req);
        if (loginMember == null) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 틀렸습니다.");
        }

        Long memberId = loginMember.getMemberId();
        String email = loginMember.getEmail();

        String access = jwtProvider.createAccessToken(memberId, email);
        String refresh = jwtProvider.createRefreshToken(memberId);

        Cookie cookie = new Cookie("refresh_token", refresh);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // 운영 HTTPS true
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24 * 14);
        response.addCookie(cookie);

        // access는 바디로 내려줌(프론트에서 localStorage 등 저장 후 Authorization 헤더에 넣기)
        return ResponseEntity.ok(Map.of(
                "access", access,
                "memberId", memberId,
                "email", email,
                "nickname", loginMember.getNickname()
        ));
    }

    // ==========================
    // 5) me (JWT 기반)
    // ==========================
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body("NO_AUTH");

        // JwtAuthFilter가 principal = memberId(String) 로 넣음
        String memberId = String.valueOf(auth.getPrincipal());

        // 실무적으로는 memberId로 DB 조회해서 Member 내려주는 게 더 좋음.
        return ResponseEntity.ok(Map.of("memberId", memberId));
    }
}

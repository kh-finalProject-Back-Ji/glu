package edu.kh.goodsugar.member.controller;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.dto.request.EmailSendRequest;
import edu.kh.goodsugar.member.model.dto.request.EmailVerifyRequest;
import edu.kh.goodsugar.member.model.dto.request.LoginRequest;
import edu.kh.goodsugar.member.model.dto.request.SignupRequest;
import edu.kh.goodsugar.member.model.service.MemberService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MemberController {

    private final MemberService service;

    // ==========================
    // 1) 중복 체크
    // ==========================

    @GetMapping("/email/exists")
    public ResponseEntity<?> existsEmail(@RequestParam("email") String email) {
        boolean exists = service.existsEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/nickname/exists")
    public ResponseEntity<?> existsNickname(@RequestParam String nickname) {
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
    // 4) 로그인/로그아웃/me
    // ==========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {

        Member loginMember = service.login(req);

        if (loginMember == null) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 틀렸습니다.");
        }

        session.setAttribute("loginMember", loginMember);
        return ResponseEntity.ok(loginMember);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Object obj = session.getAttribute("loginMember");
        if (obj == null) return ResponseEntity.status(401).body("NO_SESSION");
        return ResponseEntity.ok(obj);
    }
}


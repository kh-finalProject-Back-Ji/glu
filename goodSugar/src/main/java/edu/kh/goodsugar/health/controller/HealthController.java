package edu.kh.goodsugar.health.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.health.model.dto.DiabetesProfile;
import edu.kh.goodsugar.health.model.service.DiabetesProfileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DiabetesProfileService service;

    private Long currentMemberId(Authentication authentication) {
        String memberIdStr = (String) authentication.getPrincipal(); // JwtAuthFilter에서 String 넣음
        return Long.parseLong(memberIdStr);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Long memberId = currentMemberId(authentication);
        DiabetesProfile profile = service.getProfile(memberId);
        return ResponseEntity.ok(profile); // 없으면 null
    }

    @PutMapping("/profile")
    public ResponseEntity<?> saveProfile(Authentication authentication,
    		@RequestBody DiabetesProfile req) {
        Long memberId = currentMemberId(authentication);
        req.setMemberId(memberId);
        service.upsert(req);
        return ResponseEntity.ok().build();
    }
}


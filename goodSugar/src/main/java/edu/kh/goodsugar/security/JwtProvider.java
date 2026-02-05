package edu.kh.goodsugar.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

    private final SecretKey key;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.access-minutes}")
    private long accessMinutes;

    @Value("${app.jwt.refresh-days}")
    private long refreshDays;

    public JwtProvider(@Value("${app.jwt.secret:}") String secret) {

        // ✅ secret이 없으면 (개발용) 랜덤 키 생성
        if (secret == null || secret.isBlank()) {
            SecretKey generated = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
            this.key = generated;

            // 개발 편의: 재시작하면 바뀌니 "로그인 풀림" 주의
            String base64 = java.util.Base64.getEncoder().encodeToString(generated.getEncoded());
            System.out.println("[DEV] JWT secret is not set. Generated new secret (Base64): " + base64);
        } else {
            this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessMinutes * 60);

        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(memberId))
                .claims(Map.of("email", email, "type", "access"))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(Long memberId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(refreshDays * 24 * 60 * 60);

        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(memberId))
                .claims(Map.of("type", "refresh"))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}


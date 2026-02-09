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

    @Value("${app.jwt.issuer:goodsugar}")
    private String issuer;

    @Value("${app.jwt.access-minutes:15}")
    private long accessMinutes;

    @Value("${app.jwt.refresh-days:14}")
    private long refreshDays;

    // ✅ secret이 비어있으면 앱이 죽지 않게 방어 + 개발용 랜덤키 생성
    // - 운영에서는 반드시 app.jwt.secret(또는 JWT_SECRET 환경변수)을 넣는 걸 권장
    public JwtProvider(@Value("${app.jwt.secret:}") String secret) {
        if (secret == null || secret.isBlank()) {
            // HS256에 안전한 키(>=256bit) 자동 생성
            this.key = Jwts.SIG.HS256.key().build();
            System.out.println("[JWT] app.jwt.secret is empty -> generated random key (dev only). " +
                               "Restart will invalidate existing tokens.");
        } else {
            // HS256 최소 32바이트 이상 필요(짧으면 WeakKeyException 발생)
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
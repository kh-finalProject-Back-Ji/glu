package edu.kh.goodsugar.member.model.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendVerifyCode(String toEmail, String code, int minutes) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(toEmail);
        msg.setSubject("[GoodSugar] 이메일 인증코드");
        msg.setText(
            "GoodSugar 이메일 인증코드입니다.\n\n" +
            "인증코드: " + code + "\n" +
            "유효시간: " + minutes + "분\n\n" +
            "본인이 요청한 것이 아니라면 이 메일을 무시하세요."
        );

        mailSender.send(msg);
    }
}
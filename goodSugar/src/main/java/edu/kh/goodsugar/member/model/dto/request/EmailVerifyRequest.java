package edu.kh.goodsugar.member.model.dto.request;

import lombok.Data;

@Data
public class EmailVerifyRequest {
    private String email;
    private String code;
}
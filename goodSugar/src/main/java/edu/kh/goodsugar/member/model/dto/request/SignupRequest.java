package edu.kh.goodsugar.member.model.dto.request;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String email;
    private String password;
    private String nickname;

    private String name;
    private String gender;
    private LocalDate memberBirth;
}
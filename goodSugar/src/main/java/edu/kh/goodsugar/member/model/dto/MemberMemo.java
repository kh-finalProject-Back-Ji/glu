package edu.kh.goodsugar.member.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberMemo {
    private Long memberId;
    private String memo;           // CLOB -> String
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

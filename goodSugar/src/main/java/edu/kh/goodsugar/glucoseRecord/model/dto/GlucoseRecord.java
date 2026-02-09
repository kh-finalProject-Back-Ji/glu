package edu.kh.goodsugar.glucoseRecord.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import edu.kh.goodsugar.glucoseRecord.model.enums.MeasureType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlucoseRecord {

    private Long recordId;     // ✅ recordID -> recordId
    private Long memberId;

    private Integer glucoseValue;

    private Boolean drinkYN;
    private Boolean exerciseYN;
    private String exerciseContents;

    private LocalDate measureDate;
    private LocalTime measureTime;        // ✅ 그대로 유지 (TypeHandler로 처리)

    private MeasureType measureType;      // ✅ enum으로 고정(FASTING/BEFORE_MEAL/AFTER_1H/AFTER_2H/UNKNOWN)

    private Boolean medicationYN;
    private String medicationInfo;

    private Boolean injectionYN;
    private String injectionInfo;

    private String diet;
    private String logContent;

    private String glucoseType;

    private LocalDateTime createdAt;
}
package edu.kh.goodsugar.health.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DiabetesProfile {
  private Long memberId;

  private String diabetesType;      // TYPE1/TYPE2...
  private LocalDate diagnoseAt;
  private BigDecimal hba1cValue;
  private LocalDate hba1cDate;

  private String hasComplication;   // Y/N
  private BigDecimal weight;

  private String medicationInfo;
  private String familyHistoryYn;   // Y/N

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
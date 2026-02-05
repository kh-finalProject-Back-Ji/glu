package edu.kh.goodsugar.glucoseRecord.model.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlucoseDay {
	private LocalDate measureDate;

    // 하루 기록 개수
    private Integer recordCount;

    // 하루에 하나라도 있으면 true
    private Boolean drinkYN;
    private Boolean MedicationYN;
    private Boolean injectionYN;
    private Boolean exerciseYN;

    // 공복 혈당 (있을 때만)
    private Integer glucoseValue;
}

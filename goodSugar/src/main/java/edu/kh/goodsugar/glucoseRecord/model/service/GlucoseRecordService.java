package edu.kh.goodsugar.glucoseRecord.model.service;

import java.time.LocalDate;
import java.util.List;

import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseDay;
import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseRecord;

public interface GlucoseRecordService {
	 // 캘린더 조회
    List<GlucoseDay> selectCalendarDays(Long memberId, LocalDate startDate, LocalDate endDate);

    // 단일 기록 조회
    GlucoseRecord selectGlucoseRecord(Long recordId);

    // Create
    void insertGlucoseRecord(GlucoseRecord record);

    // Update
    void updateGlucoseRecord(GlucoseRecord record);

    // Delete
    void deleteGlucoseRecord(Long recordId);
    
    List<GlucoseRecord> selectRecordsByDate(Long memberId, LocalDate measureDate);

}
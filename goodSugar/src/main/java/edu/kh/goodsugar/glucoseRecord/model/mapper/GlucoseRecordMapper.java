package edu.kh.goodsugar.glucoseRecord.model.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseDay;
import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseRecord;

@Mapper
public interface GlucoseRecordMapper {

    List<GlucoseDay> selectCalendarDays(@Param("memberId") Long memberId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    GlucoseRecord selectGlucoseRecord(@Param("recordId") Long recordId);

    void insertGlucoseRecord(GlucoseRecord record);

    void updateGlucoseRecord(GlucoseRecord record);

    void deleteGlucoseRecord(@Param("recordId") Long recordId);
    
    List<GlucoseRecord> selectRecordsByDate(@Param("memberId") Long memberId,
            @Param("measureDate") LocalDate measureDate);

}
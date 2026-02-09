package edu.kh.goodsugar.glucoseRecord.model.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseDay;
import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseRecord;
import edu.kh.goodsugar.glucoseRecord.model.mapper.GlucoseRecordMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GlucoseRecordServiceImpl implements GlucoseRecordService {

	private final GlucoseRecordMapper mapper;
	 @Override
	    public List<GlucoseDay> selectCalendarDays(Long memberId, LocalDate startDate, LocalDate endDate) {
	        return mapper.selectCalendarDays(memberId, startDate, endDate);
	    }

	    @Override
	    public GlucoseRecord selectGlucoseRecord(Long recordId) {
	        return mapper.selectGlucoseRecord(recordId);
	    }

	    @Override
	    public void insertGlucoseRecord(GlucoseRecord record) {
	        mapper.insertGlucoseRecord(record);
	    }

	    @Override
	    public void updateGlucoseRecord(GlucoseRecord record) {
	        mapper.updateGlucoseRecord(record);
	    }

	    @Override
	    public void deleteGlucoseRecord(Long recordId) {
	        mapper.deleteGlucoseRecord(recordId);
	    }
	    @Override
	    public List<GlucoseRecord> selectRecordsByDate(Long memberId, LocalDate measureDate) {
	        return mapper.selectRecordsByDate(memberId, measureDate);
	    }

    
}
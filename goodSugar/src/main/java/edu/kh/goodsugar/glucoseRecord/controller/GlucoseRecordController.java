package edu.kh.goodsugar.glucoseRecord.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseDay;
import edu.kh.goodsugar.glucoseRecord.model.dto.GlucoseRecord;
import edu.kh.goodsugar.glucoseRecord.model.service.GlucoseRecordService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("glucose")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GlucoseRecordController {

	
	private final GlucoseRecordService service;
   
@GetMapping //캘린더 집계조회(음주,약,주사,운동 유무와 공복혈당,기록 개수 반환)
public List<GlucoseDay> getCalendarDays(
		@RequestParam Long memberId,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate startDate,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate endDate
		)
{return service.selectCalendarDays(memberId, startDate, endDate);
	
}

	@GetMapping("/{recordId}") //단일 혈당 기록 조회
	public GlucoseRecord getGlucoseRecord(@PathVariable Long recordId) {
		return service.selectGlucoseRecord(recordId);
	}
    
	
	@PostMapping //혈당 기록 추가
	public ResponseEntity<String> addGlucoseRecord(@RequestBody GlucoseRecord record) {
		service.insertGlucoseRecord(record);
		return ResponseEntity.ok("저장 완료");
		
	}
	
	@PutMapping("/{recordId}") //혈당 기록 수정
	public ResponseEntity<String> updateGlucoseRecord(@PathVariable Long recordId,
			@RequestBody GlucoseRecord record){
		
		record.setRecordId(recordId);
		service.updateGlucoseRecord(record);
		return ResponseEntity.ok("수정 완료");
	}
	
	@DeleteMapping("/{recordId}")
	public ResponseEntity<String> deleteGlucoseRecord(@PathVariable Long recordId){
		
		   service.deleteGlucoseRecord(recordId);
		   return ResponseEntity.ok("삭제 완료");
	}
	
	@GetMapping("/day")
	public List<GlucoseRecord> getRecordsByDate(
	        @RequestParam Long memberId,
	        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
	) {
	    return service.selectRecordsByDate(memberId, date);
	}

	
}
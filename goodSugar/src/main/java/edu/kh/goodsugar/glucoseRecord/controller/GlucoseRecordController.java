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

  @GetMapping
  public List<GlucoseDay> getCalendarDays(
      @RequestParam("memberId") Long memberId,
      @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam("endDate")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
  ) {
    return service.selectCalendarDays(memberId, startDate, endDate);
  }

  @GetMapping("/{recordId}")
  public GlucoseRecord getGlucoseRecord(@PathVariable("recordId") Long recordId) {
    return service.selectGlucoseRecord(recordId);
  }

  @PostMapping
  public ResponseEntity<String> addGlucoseRecord(@RequestBody GlucoseRecord record) {
    service.insertGlucoseRecord(record);
    return ResponseEntity.ok("저장 완료");
  }

  @PutMapping("/{recordId}")
  public ResponseEntity<String> updateGlucoseRecord(
      @PathVariable("recordId") Long recordId,
      @RequestBody GlucoseRecord record
  ) {
    record.setRecordId(recordId);
    service.updateGlucoseRecord(record);
    return ResponseEntity.ok("수정 완료");
  }

  @DeleteMapping("/{recordId}")
  public ResponseEntity<String> deleteGlucoseRecord(@PathVariable("recordId") Long recordId) {
    service.deleteGlucoseRecord(recordId);
    return ResponseEntity.ok("삭제 완료");
  }

  @GetMapping("/day")
  public List<GlucoseRecord> getRecordsByDate(
      @RequestParam("memberId") Long memberId,
      @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
  ) {
    return service.selectRecordsByDate(memberId, date);
  }
}

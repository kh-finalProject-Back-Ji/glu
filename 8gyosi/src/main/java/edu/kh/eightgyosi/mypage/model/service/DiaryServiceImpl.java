package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.DiaryDTO;
import edu.kh.eightgyosi.mypage.model.dto.FontDTO;
import edu.kh.eightgyosi.mypage.model.mapper.DiaryMapper;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class DiaryServiceImpl implements DiaryService{
	
	@Autowired
	private DiaryMapper diaryMapper; // 다이어리 메퍼 선언

	// 일기장 내용 저장 서비스
	@Override
	public int insertDiary(DiaryDTO inputDiary) {
		
		
		return diaryMapper.insertDiary(inputDiary);
	}
	
	// 일기장 내용 불러오기 서비스
	@Override
	public DiaryDTO selectDiary(DiaryDTO inputDiary) {
		log.info(inputDiary.toString());
		
		return diaryMapper.selectDiary(inputDiary);
	}

	// 일기장 내용 삭제 서비스
	@Override
	public int deleteDiary(DiaryDTO inputDiary) {
		return diaryMapper.deleteDiary(inputDiary);
	}
	

	// 일기장 작성일 중복 확인 메서드
	@Override
	public int checkWriteDate(DiaryDTO inputDiary) {
		return diaryMapper.checkWriteDate(inputDiary);
	}
	
	
	// 회원 동기부여 글 수정 메서드
	@Override
	public int updateQuotes(FontDTO inputQuotes) {
		return diaryMapper.updateQuotes(inputQuotes);
	}
	
	// 회원 동기부여 글꼴 조회 서비스
	@Override
	public FontDTO selectquotesFont(int memberNo) {
		// TODO Auto-generated method stub
		return diaryMapper.selectquotesFont(memberNo);
	}
}




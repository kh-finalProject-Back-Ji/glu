package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.DiaryDTO;
import edu.kh.eightgyosi.mypage.model.dto.FontDTO;

public interface DiaryService {

	/** 일기장 내용 저장 서비스
	 * @param inputDiary
	 * @return
	 */
	int insertDiary(DiaryDTO inputDiary);

	
	/** 일기장 내용 검색 서비스
	 * @param inputDiary
	 * @return
	 */
	DiaryDTO selectDiary(DiaryDTO inputDiary);

	
	/** 일기장 내용 삭제 서비스
	 * @param inputDiary
	 * @return
	 */
	int deleteDiary(DiaryDTO inputDiary);

	

	/** 일기장 작성일 중복 확인 메서드
	 * @param inputDiary
	 * @return
	 */
	int checkWriteDate(DiaryDTO inputDiary);




	/** 회원 동기부여 수정 메서드
	 * @param inputQuotes
	 * @return
	 */
	int updateQuotes(FontDTO inputQuotes);



	/** 회원 동기부여 글꼴 조회 서비스
	 * @param memberNo
	 * @return
	 */
	FontDTO selectquotesFont(int memberNo);



	


}

package edu.kh.eightgyosi.mypage.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.DiaryDTO;
import edu.kh.eightgyosi.mypage.model.dto.FontDTO;

@Mapper
public interface DiaryMapper {

	/** 일기장 내용 저장 SQL
	 * @param inputDiary
	 * @return
	 */
	int insertDiary(DiaryDTO inputDiary);

	/** 일기장 내용 불러오기 SQL
	 * @param inputDiary
	 * @return
	 */
	DiaryDTO selectDiary(DiaryDTO inputDiary);

	/** 일기장 내용 삭제 SQL
	 * @param inputDiary
	 * @return
	 */
	int deleteDiary(DiaryDTO inputDiary);



	/** 일기장 작성일 중복 확인 SQL
	 * @param inputDiary
	 * @return
	 */
	int checkWriteDate(DiaryDTO inputDiary);



	/** 회원 동기부여글 수정 SQL
	 * @param inputQuotes
	 * @return
	 */
	int updateQuotes(FontDTO inputQuotes);



	/** 회원 동기부여 글꼴 조회 SQL
	 * @param memberNo
	 * @return
	 */
	FontDTO selectquotesFont(int memberNo);
	
	





}

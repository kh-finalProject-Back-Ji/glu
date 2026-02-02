package edu.kh.eightgyosi.mypage.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.CalenderDTO;
import edu.kh.eightgyosi.mypage.model.dto.ProfileUploadFile;
import edu.kh.eightgyosi.mypage.model.dto.TimetableDTO;
import edu.kh.eightgyosi.mypage.model.dto.WrongNoteDTO;

@Mapper
public interface MyPageMapper {

	/** memberNo로 캘린더 조회 SQL
	 * @param memberNo
	 * @return
	 */
	List<CalenderDTO> selectCalender(int memberNo);

	/** memberNo로 오답노트 조회 SQL(제일 최신 거만)
	 * @param memberNo
	 * @return
	 */
	List<WrongNoteDTO> selectWrongNote(int memberNo);

	/** 오답노트 등록 서비스
	 * @param wrongNote
	 * @return
	 */
	int insertWrongNote(WrongNoteDTO wrongNote);

	/** 회원 정보 수정 SQL
	 * @param member
	 * @return
	 */
	int updateInfo(Member member);

	/** 회원의 암호화된 비밀번호 조회 SQL
	 * @param memberNo
	 * @return
	 */
	String selectPw(int memberNo);

	/** 회원 비밀번호 변경 SQL
	 * @param paramMap
	 * @return
	 */
	int changePw(Map<String, Object> paramMap);

	/** 회원 탈퇴
	 * @param memberNo
	 * @return
	 */
	int secession(int memberNo);
	
	
	/** 시간표 조회 서비스
	 * @param map
	 * @return
	 */
	List<TimetableDTO> selectTimetable(Map<String, Object> map);

	/** 파일 정보를 DB에 삽입 SQL (insert)
	 * @param uf
	 * @return
	 */
	int insertUploadFile(ProfileUploadFile uf);

	/** 회원 프로필 변경 SQL
	 * @param member
	 * @return
	 */
	int profile(Member member);
	int insertTimetable(Map<String, Object> allMap);

	
}

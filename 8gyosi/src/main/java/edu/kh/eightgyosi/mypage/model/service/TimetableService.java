package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.eightgyosi.mypage.model.dto.TimetableDTO;

public interface TimetableService {

	/** 시간표 조회 서비스(처음 마이페이지 진입 시 사용)
	 * @param memberNo
	 * @return
	 */
	List<TimetableDTO> selectTimetable(int memberNo);

	
	/** 시간표 조회 서비스(비동기 요청 시)
	 * @param memberNo
	 * @param semester
	 * @return
	 */
	List<TimetableDTO> selectTimetable(int memberNo, String semester);

	int insertTimetable(Map<String, Object> map, int memberNo);

	
	
}

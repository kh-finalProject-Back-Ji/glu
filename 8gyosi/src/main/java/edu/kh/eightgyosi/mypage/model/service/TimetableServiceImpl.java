package edu.kh.eightgyosi.mypage.model.service;

import java.sql.Time;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.kh.eightgyosi.board.model.service.BoardSerivceImpl;
import edu.kh.eightgyosi.mypage.model.dto.TimetableDTO;
import edu.kh.eightgyosi.mypage.model.mapper.MyPageMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TimetableServiceImpl implements TimetableService{

    private final BoardSerivceImpl boardSerivceImpl;
	
	@Autowired
	private MyPageMapper mapper;

    TimetableServiceImpl(BoardSerivceImpl boardSerivceImpl) {
        this.boardSerivceImpl = boardSerivceImpl;
    }
	
	/**
	 * 시간표 조회 서비스
	 */
	@Override
	public List<TimetableDTO> selectTimetable(int memberNo) {
		
		Map<String, Object> map = new HashMap<>();
		String semesterTemp = null;
		String semester = makeSemester(semesterTemp);
		
		map.put("semester", semester);
		map.put("memberNo", memberNo);
		
		List<TimetableDTO> tempResult = mapper.selectTimetable(map);
		
		// 만약 조회 결과가 없다면 현재 날짜 기준의 semester 만든다
		// 만든 semester 를 새로운 dto 객체 생성해 설정하고
		// 이 객체를 조회된 결과에 넣는다 > 다른 필드값은 없고 semester 만 있을 것
		if(tempResult.size() == 0) {
			semesterTemp = makeSemester(semesterTemp);
			TimetableDTO tempDTO = new TimetableDTO();
			tempDTO.setSemester(semesterTemp);
			tempResult.set(0, tempDTO);
			
			return tempResult; // 이때 반환되는 list 에는 0번째 인덱스 객체에 semester(2025-2)만 들어있다.
			
		}else {
			// 만약 조회 결과가 1행이라도 있다면 해당 정보를 담아서 반환
			List<TimetableDTO> list = apartSemester(tempResult);
			return list;
		}
		
		
	}
	
	@Override
	public int insertTimetable(Map<String, Object> map, int memberNo) {
		
		log.debug(map.toString());
		// 가져온 map 가공
		String year = String.valueOf(map.get("tyear"));
		String period = String.valueOf(map.get("tperiod"));
		String semester = year + "-" + period;
		
		// mapper 로 보낼 map 생성
		Map<String, Object> allMap = new HashMap<String, Object>();
		
		// map 에 담을 임시 list 생성
		List<String> list = new ArrayList<>();
		// map.entrySet() : Map 객체에 저장된 모든 k-v 쌍을 꺼내온다
		// .stream() : 데이터를 순차적으로 검사하는 통로를 여는 함수
		// .filter(): stream() 과 함께 사용되어, 해당 통로의 요소들을 조건에 맞게 걸러내는 함수
		// stream 에서 흐르는 모든 요소들을 temp -> 통하여 temp라는 변수를 설정
		// 해당 temp 에서 정규식(\\d{2}, 2자리 숫자)을 만족하는 모든 key 값을 꺼내옴
		map.entrySet().stream().filter(temp -> temp.getKey().matches("\\d{2}"))
			.forEach(temp -> {
				String day = temp.getKey().substring(0,1);
				String cls = temp.getKey().substring(1,2);
				String subject = (String) temp.getValue();
				String dayClassSubject = day+cls+subject;
				list.add(dayClassSubject);
			});
		
		// 학기 정보 map 에 등록
		allMap.put("semester", semester);
		
		// memberNo 등록
		allMap.put("memberNo", memberNo);
		
		allMap.put("list", list);
		
		int result = mapper.insertTimetable(allMap);
	
		return result;
	}
	
	/**
	 * 비동기요청 시간표 조회
	 */
	@Override
	public List<TimetableDTO> selectTimetable(int memberNo, String semesterTemp) {
		
		Map<String, Object> map = new HashMap<>();
		String semester = makeSemester(semesterTemp);
		
		map.put("semester", semester);
		map.put("memberNo", memberNo);
		
		List<TimetableDTO> tempResult = mapper.selectTimetable(map);
		
		
		// 조회결과가 없다면 그대로 돌려준다
		if(tempResult.size() == 0) {

			return tempResult; // 
			
		}else {
			// 만약 조회 결과가 1행이라도 있다면 해당 정보를 담아서 반환
			List<TimetableDTO> list = apartSemester(tempResult);
			return list;
		}

	}
	
	/** 시간표 조회 전 semseter 변수 합치는 메서드
	 * @param semester
	 * @return
	 */
	public String makeSemester(String semester) {
		
		if(semester == null) {
			// 현재 연도와 월 구해서 전달
			// 학기 : 9~12/1~2 : 1학기, 3~8 : 2학기
			LocalDate time = LocalDate.now();
			int year = time.getYear();
			int month = time.getMonthValue();
			
			if (month <= 2 || month >= 9) {
				year -= 1;
				semester = Integer.toString(year) + "-2"; // ex > 연도 + 2 : 2026-2 형태를 String 으로 저장
			}else {
				semester = Integer.toString(year) + "-1";
			}
			
			return semester;
			
			// null 이 아닐 경우 가져온 값 그대로 return
		}else return semester;

	}
	
	/** 시간표 조회 후 semester 변수 분리하는 메서드
	 * @param list
	 * @return
	 */
	public List<TimetableDTO> apartSemester(List<TimetableDTO> list){
		
		// timetable select 결과는 DTO 객체로 이루어져 있고, 이때 DTO DAY_CLASS_SUBJECT 는 '1-2-과목' 형태로 되어 있음
		// 아래 코드는 이를 분리 하여 '1(day,요일), 2(class,교시), 3(subject,과목) 으로 분리하고 이를 다시 결과에 담아주는 작업
		int day = 0;
		int cls = 0;
		String subject = null;
		
		for(int i = 0; i < list.size(); i++) {
			String dcs = list.get(i).getDayClassSubject();
			String[] dcsPart = dcs.split("-");
			day = Integer.parseInt(dcsPart[0]);
			cls = Integer.parseInt(dcsPart[1]);
			subject = dcsPart[2];
			list.get(i).setDay(day);
			list.get(i).setCls(cls);
			list.get(i).setSubject(subject);
		}
		
		return list;
		
	}
	
}

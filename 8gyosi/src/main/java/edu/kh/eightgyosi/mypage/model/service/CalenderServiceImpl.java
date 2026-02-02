package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.mypage.model.dto.CalenderDTO;
import edu.kh.eightgyosi.mypage.model.mapper.MyPageMapper;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class CalenderServiceImpl implements CalenderService{
	
	@Autowired
	private MyPageMapper calMapper;
	
	@Override
	public List<CalenderDTO> selectCalender(int memberNo) {
		
		List<CalenderDTO> result = calMapper.selectCalender(memberNo);
		
		// mapper 통해 얻어온 날짜를 잘라내 객체에 저장
		for(int i = 0; i < result.size(); i++) {
			
			int startYear = Integer.parseInt(result.get(i).getStartDate().substring(0,4));
			int startMonth = Integer.parseInt(result.get(i).getStartDate().substring(5,7));
			int startDay = Integer.parseInt(result.get(i).getStartDate().substring(8,10));
			
			int endYear = Integer.parseInt(result.get(i).getEndDate().substring(0,4));
			int endMonth = Integer.parseInt(result.get(i).getEndDate().substring(5,7));
			int endDay = Integer.parseInt(result.get(i).getEndDate().substring(8,10));
			
			result.get(i).setStartYear(startYear);
			result.get(i).setStartMonth(startMonth);
			result.get(i).setStartDay(startDay);
			result.get(i).setEndYear(endYear);
			result.get(i).setEndMonth(endMonth);
			result.get(i).setEndDay(endDay);
			
		}
		
		return result;
	}
	

}

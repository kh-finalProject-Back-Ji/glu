package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.CalenderDTO;

public interface CalenderService {

	List<CalenderDTO> selectCalender(int memberNo);
	
}

package edu.kh.eightgyosi.mypage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalenderDTO {
	
	private int calenderId;
	private String startDate;
	private String endDate;
	private String calenderContent;
	private int memberNo;
	
	// 아래 6개 필드는 String 으로 저장된 date 타입을 service 단에서 int 로 저장할 것임
	private int startYear;
	private int startMonth;
	private int startDay;
	private int endYear;
	private int endMonth;
	private int endDay;
}

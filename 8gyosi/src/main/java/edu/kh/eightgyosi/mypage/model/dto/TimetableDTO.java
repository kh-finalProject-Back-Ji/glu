package edu.kh.eightgyosi.mypage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableDTO {
	
	private int timetableId;
	private String semester;
	private int memberNo;
	private String dayClassSubject;
	
	private int day;
	private int cls;
	private String subject;
	
	
}

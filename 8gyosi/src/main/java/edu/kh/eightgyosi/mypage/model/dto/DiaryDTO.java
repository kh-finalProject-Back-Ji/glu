package edu.kh.eightgyosi.mypage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryDTO {
	
	// DIARY 테이블과 동일
	private int diaryNo;
	private String diaryDate;
	private String diaryTitle;
	private String diaryContent;
	private int memberNo;
	
}

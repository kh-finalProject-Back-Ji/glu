package edu.kh.eightgyosi.mypage.model.dto;

import edu.kh.eightgyosi.member.model.dto.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FontDTO {
	
	private String quotesContent;
	private int fontSize;
	private String fontFamily;
	
	private int memberNo;
}

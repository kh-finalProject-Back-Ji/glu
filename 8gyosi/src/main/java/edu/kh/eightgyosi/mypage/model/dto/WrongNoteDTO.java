package edu.kh.eightgyosi.mypage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class WrongNoteDTO {

	private int wrongNoteNo;
	private String wrongNoteTitle;
	private String wrongNoteContent;
	private String wrongNoteMyanswer;
	private String wrongNoteExplain;
	private int wrongNoteType;
	private String wrongNoteDate;
	private int memberNo;
	private int wrongNoteUnderstood;

}

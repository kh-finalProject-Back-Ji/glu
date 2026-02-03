package edu.kh.goodsugar.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Board {
	
	/* 게시글 번호 */
	private int boardId;
	
	/* 게시글 제목 */
	private String boardTitle;
	
	/* 게시글 내용 */
	private String boardContent;
	
	/* 게시글 조회수 */
	private int boardViewCount;
	
	/* 게시글 삭제 여부(Y/N) */
	private String boardDeletedFl;
	
	/* 게시글 작성 */
	private String boardCreate;
	
	/* 게시글 수정 */
	private String boardUpdate;
	
	/* 익명 여부(Y/N) */
	private String isAnonymousYn;
	
	/* 게시글 종류 번호 */
	private int boardTypeId;
	
	/* 작성자 회원 번호 */
	private int memberId;
}

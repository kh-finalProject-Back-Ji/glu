package edu.kh.goodsugar.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Board {
	
	/** 게시글 번호 (PK) */
    private int boardId;

    /** 게시글 제목 */
    private String boardTitle;

    /** 게시글 내용 */
    private String boardContent;

    /** 게시글 조회수 */
    private int boardViewCount;

    /** 게시글 삭제 여부 (Y/N) */
    private String boardIsDeleteFl;

    /** 게시글 작성일 */
    private String boardCreate;

    /** 게시글 수정일 */
    private String boardUpdate;
    
    /** 익명 여부 */
    private String isAnonymousYn;
    
    /** 익명 이름 */
    private String anonymousName;

    /** 게시판 타입 번호 */
    private int boardTypeId;

    /** 작성자 회원 번호 */
    private int memberId;
    
    /** 닉네임 */
    private String nickname;
    
    // SNACK 테이블
    
    /** 게시글 번호(PK) */
    private int snackId;
    
    /** 먹은 량(ml) */
    private String details;
    
    /** 1시간 이후 혈당 */
    private int bloodSugarF;
    
    /** 2시간 이후 혈당 */
    private int bloodSugarS;
    
    /** 공복 혈당 */
    private int fastingGlu;
    
    /** 운동 여부 */
    private String exer;
    
    /** 맛 평가 */
    private int tasterating;

}

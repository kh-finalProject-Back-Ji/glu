package edu.kh.eightgyosi.board.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게시글 댓글 DTO
 * - board_comment 테이블과 매핑
 * - 부모 댓글 번호로 대댓글 구조 표현
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardComment {

    /** 댓글 번호 (PK) */
    private int commentNo;

    /** 댓글 내용 */
    private String commentContent;

    /** 댓글 작성일 */
    private LocalDateTime commentWriteDate;

    /** 댓글 삭제 여부 (Y/N) */
    private String commentDelFl;

    /** 게시글 번호 (FK) */
    private int boardId;

    /** 작성자 회원 번호 (FK) */
    private int memberNo;

    /** 부모 댓글 번호 (대댓글용, 없으면 0) */
    private int parentCommentNo;
    
    /** 회원 프로필 */
    private String profileImg;
    
    // 
    private String memberNickname;
}


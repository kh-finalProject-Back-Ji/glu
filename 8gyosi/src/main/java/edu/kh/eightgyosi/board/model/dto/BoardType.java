package edu.kh.eightgyosi.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게시판 타입 DTO
 * - board_type 테이블과 매핑
 * - 자유게시판, 공지사항 등 카테고리 관리용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardType {

    /** 게시판 타입 번호 (PK) */
    private int boardTypeNo;

    /** 게시판 타입 이름 */
    private String boardTypeName;

   
}

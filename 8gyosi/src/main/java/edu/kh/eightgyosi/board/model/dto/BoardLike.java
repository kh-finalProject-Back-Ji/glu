package edu.kh.eightgyosi.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

/**
 * 게시글 좋아요 DTO
 * - board_like 테이블과 매핑
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardLike {

    /** 좋아요 번호 (PK) */
    private int likeId;

    /** 게시글 번호 (FK) */
    private int boardId;

    /** 회원 번호 */
    private int memberNo;
}

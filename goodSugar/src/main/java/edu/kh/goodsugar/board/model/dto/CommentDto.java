package edu.kh.goodsugar.board.model.dto;

import java.util.Date;
import lombok.Data;

@Data
public class CommentDto {
  private Long commentId;
  private Long boardId;
  private Long parentCommentId;

  private Long memberId;
  private String commentContent;

  private String isAnonymousYn; // Y/N
  private String deleteFl;      // Y/N

  private Date createDate;
  private Date updateDate;

  // 표시용 (익명 처리 후 내려줌)
  private String writerName;
  private String writerProfileImg;
  private Long writerMemberId; // 쪽지 보내기용(익명일 때 프론트에서 숨길 수도)
}

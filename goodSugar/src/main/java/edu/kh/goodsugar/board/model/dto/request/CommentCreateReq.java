package edu.kh.goodsugar.board.model.dto.request;

import lombok.Data;

@Data
public class CommentCreateReq {
  private Long parentCommentId; // null이면 댓글, 있으면 대댓글
  private String content;
  private String isAnonymousYn; // Y/N
}

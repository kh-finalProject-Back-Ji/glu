package edu.kh.goodsugar.board.model.dto.response;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Data;

@Data
public class CommentRes {
  private Long commentId;
  private Long parentCommentId;

  private String content;
  private String deleteFl;

  private Date createdAt;
  private Date updatedAt;

  private String writerName;
  private String writerProfileImg;
  private Long writerMemberId;

  private List<CommentRes> children = new ArrayList<>();
}

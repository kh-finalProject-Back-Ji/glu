package edu.kh.goodsugar.board.model.dto.response;

import java.util.Date;
import lombok.Data;

@Data
public class BoardListItemRes {
  private Long boardId;
  private Long boardTypeId;

  private String title;
  private String preview;
  private Date createdAt;

  private String eatStatus; // SNACK일 때만

  private int likeCount;
  private int commentCount;

  private String writerName;
  private String writerProfileImg;
}

package edu.kh.goodsugar.board.model.dto.response;

import java.util.Date;
import java.util.List;

import edu.kh.goodsugar.board.model.dto.RecommendDetailDto;
import edu.kh.goodsugar.board.model.dto.SnackDetailDto;
import edu.kh.goodsugar.board.model.dto.BoardImageDto;
import lombok.Data;

@Data
public class BoardDetailRes {
  private Long boardId;
  private Long boardTypeId;

  private String title;
  private String content;

  private Date createdAt;
  private Date updatedAt;

  private Long viewCount;

  private int likeCount;
  private int commentCount;
  private boolean likedByMe;

  private String writerName;
  private String writerProfileImg;
  private Long writerMemberId;

  private SnackDetailDto snack;         // nullable
  private RecommendDetailDto recommend; // nullable

  private List<BoardImageDto> images;
}

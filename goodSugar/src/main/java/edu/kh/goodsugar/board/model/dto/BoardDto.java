package edu.kh.goodsugar.board.model.dto;

import java.util.Date;
import lombok.Data;

@Data
public class BoardDto {
  private Long boardId;
  private Long boardTypeId; // 1:SNACK, 2:FREE, 3:RECOMMEND

  private String boardTitle;
  private String boardContent;

  private Long boardViewCount;
  private String boardDeleteFl; // Y/N
  private Date boardCreate;
  private Date boardUpdate;

  private String isAnonymousYn; // Y/N
  private Long memberId;

  // 목록/상세에서 같이 쓰는 집계
  private Integer likeCount;
  private Integer commentCount;

  // 표시용 (익명 처리 후 내려줌)
  private String writerName;
  private String writerProfileImg;
}

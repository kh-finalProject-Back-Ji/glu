package edu.kh.goodsugar.board.model.dto;

import java.util.Date;
import lombok.Data;

@Data
public class BoardImageDto {
  private Long imageId;
  private Long boardId;
  private String imageUrl;
  private Integer sortOrder;
  private Date createDate;
}

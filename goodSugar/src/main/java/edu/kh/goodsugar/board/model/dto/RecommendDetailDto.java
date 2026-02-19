package edu.kh.goodsugar.board.model.dto;

import lombok.Data;

@Data
public class RecommendDetailDto {
  private Long boardId;

  private String placeName;
  private String address;
  private Double latitude;
  private Double longitude;

  private String foodName;
  private String diabeticReason;

  private String mapProvider; // KAKAO
  private String placeUrl;
}

package edu.kh.goodsugar.board.model.dto.request;

import java.util.Date;
import lombok.Data;

@Data
public class BoardCreateReq {
  private Long boardTypeId;
  private String title;
  private String content;

  private String isAnonymousYn; // Y/N

  // SNACK 상세(간식)
  private String eatStatus; // 먹음/먹고싶다
  private String snackType;
  private String useMedicationYn;
  private String useInjectionYn;
  private String glucoseType;
  private Integer glucoseValue;
  private Date measureTime;
  private String measureType;
  private Integer tasteScore;
  private Integer healthScore;

  // RECOMMEND 상세(추천)
  private String placeName;
  private String address;
  private Double latitude;
  private Double longitude;
  private String foodName;
  private String diabeticReason;
  private String mapProvider; // KAKAO
  private String placeUrl;
}

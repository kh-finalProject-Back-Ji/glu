package edu.kh.goodsugar.board.model.dto.request;

import lombok.Data;

@Data
public class BoardListReq {
  private String type;   // SNACK | FREE | RECOMMEND
  private String q;      // 검색어
  private String status; // SNACK에서만: 전체|먹음|먹고싶다
  private String sort;   // latest|likes|comments
  private int page = 1;
  private int size = 12;
}

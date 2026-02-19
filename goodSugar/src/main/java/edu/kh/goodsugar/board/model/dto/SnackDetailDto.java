package edu.kh.goodsugar.board.model.dto;

import java.util.Date;
import lombok.Data;

@Data
public class SnackDetailDto {
  private Long boardId;

  private String useMedicationYn; // Y/N
  private String useInjectionYn;  // Y/N

  private String glucoseType;
  private Integer glucoseValue;

  private Date measureTime;
  private String measureType;

  private String snackType;
  private String eatStatus; // "먹음" / "먹고싶다"

  private Integer tasteScore;  // 1~5
  private Integer healthScore; // 1~5
}

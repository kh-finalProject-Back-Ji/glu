package edu.kh.goodsugar.api.food.dto;

import lombok.Data;

@Data
public class FoodSummaryDto {
  private String foodCd;      // FOOD_CD
  private String name;        // FOOD_NM_KR
  private String servingSize; // SERVING_SIZE
}

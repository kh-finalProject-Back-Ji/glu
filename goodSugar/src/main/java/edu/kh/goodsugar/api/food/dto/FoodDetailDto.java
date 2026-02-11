package edu.kh.goodsugar.api.food.dto;

import lombok.Data;

@Data
public class FoodDetailDto extends FoodSummaryDto {
  private Double kcal;    // AMT_NUM1
  private Double carb;    // AMT_NUM6
  private Double sugar;   // AMT_NUM7
  private Double protein; // AMT_NUM3
  private Double fat;     // AMT_NUM4
  private Double satFat;  // AMT_NUM24
  private Double sodium;  // AMT_NUM13
}

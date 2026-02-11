// src/main/java/edu/kh/goodsugar/api/food/dto/FoodSearchResponseDto.java
package edu.kh.goodsugar.api.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodSearchResponseDto {
  private List<FoodSummaryDto> items;
  private int page;
  private int size;
  private int totalCount;
  private int totalPages;
}

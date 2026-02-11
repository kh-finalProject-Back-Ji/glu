package edu.kh.goodsugar.api.food;

import edu.kh.goodsugar.api.food.dto.FoodDetailDto;
import edu.kh.goodsugar.api.food.dto.FoodSearchResponseDto;

public interface FoodNutrService {
  FoodSearchResponseDto search(String query, int page, int size);
  FoodDetailDto detail(String foodCd, String name);
}

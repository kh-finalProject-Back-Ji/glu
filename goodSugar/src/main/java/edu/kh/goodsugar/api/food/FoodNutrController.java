package edu.kh.goodsugar.api.food;

import edu.kh.goodsugar.api.food.dto.FoodDetailDto;
import edu.kh.goodsugar.api.food.dto.FoodSearchResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/foods")

public class FoodNutrController {

  private final FoodNutrService service;

  @GetMapping
  public FoodSearchResponseDto search(
      @RequestParam(name = "query", required = false, defaultValue = "") String query,
      @RequestParam(name = "page", defaultValue = "1") int page,
      @RequestParam(name = "size", defaultValue = "60") int size
  ) {
    return service.search(query, page, size);
  }

  @GetMapping("/{foodCd}")
  public FoodDetailDto detail(
      @PathVariable("foodCd") String foodCd,
      @RequestParam(value = "name", required = false, defaultValue = "") String name
  ) {
    System.out.println("[DETAIL] foodCd=" + foodCd + " name=" + name);
    return service.detail(foodCd, name);
  }

}

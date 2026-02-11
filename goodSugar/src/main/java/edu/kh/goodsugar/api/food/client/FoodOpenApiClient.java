package edu.kh.goodsugar.api.food.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class FoodOpenApiClient {

  private final WebClient webClient;

  @Value("${openapi.key}")
  private String key;

  public String searchXml(String query, int page, int size) {
    return webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/getFoodNtrCpntDbInq02")
            .queryParam("serviceKey", key)
            .queryParam("pageNo", page)
            .queryParam("numOfRows", size)
            .queryParam("FOOD_NM_KR", query)
            .build())
        .retrieve()
        .bodyToMono(String.class)
        .block();
  }

  // ✅ 기존 numOfRows=1 이 문제였음 → 100으로 크게 받아서 서버에서 FOOD_CD 매칭
  public String detailByFoodCdXml(String foodCd) {
    return webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/getFoodNtrCpntDbInq02")
            .queryParam("serviceKey", key)
            .queryParam("pageNo", 1)
            .queryParam("numOfRows", 100) // ✅ 핵심 변경
            .queryParam("FOOD_CD", foodCd)
            .build())
        .retrieve()
        .bodyToMono(String.class)
        .block();
  }
}



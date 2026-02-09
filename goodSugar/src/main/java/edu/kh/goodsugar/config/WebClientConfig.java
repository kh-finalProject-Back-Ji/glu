package edu.kh.goodsugar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

  @Value("${openapi.base}")
  private String base;

  @Bean
  public WebClient webClient() {
    ExchangeStrategies strategies = ExchangeStrategies.builder()
        .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
        .build();

    return WebClient.builder()
        .baseUrl(base)                 // ✅ 핵심
        .exchangeStrategies(strategies)
        .build();
  }
}

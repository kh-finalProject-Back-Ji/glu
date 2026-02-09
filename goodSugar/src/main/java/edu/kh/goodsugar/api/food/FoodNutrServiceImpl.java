package edu.kh.goodsugar.api.food;

import edu.kh.goodsugar.api.food.client.FoodOpenApiClient;
import edu.kh.goodsugar.api.food.dto.FoodDetailDto;
import edu.kh.goodsugar.api.food.dto.FoodSearchResponseDto;
import edu.kh.goodsugar.api.food.dto.FoodSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodNutrServiceImpl implements FoodNutrService {

  private final FoodOpenApiClient client;

  @Override
  public FoodSearchResponseDto search(String query, int page, int size) {
    String xml = client.searchXml(query, page, size);

    List<FoodSummaryDto> items = parseSummaries(xml);
    int totalCount = parseTotalCount(xml);
    int totalPages = (size <= 0) ? 1 : (int) Math.ceil(totalCount / (double) size);
    if (totalPages <= 0) totalPages = 1;

    return FoodSearchResponseDto.builder()
        .items(items)
        .page(page)
        .size(size)
        .totalCount(totalCount)
        .totalPages(totalPages)
        .build();
  }

  @Override
  public FoodDetailDto detail(String foodCd, String name) {
    if (foodCd == null || foodCd.isBlank()) return null;

    // ✅ 1) FOOD_CD 파라미터로 요청하되, 응답에서 "foodCd 일치하는 item"을 스캔
    try {
      String xml = client.detailByFoodCdXml(foodCd);

      FoodDetailDto dto = parseDetailByFoodCd(xml, foodCd);
      if (dto != null) return dto;

      // 디버그 로그 (필요하면 남겨)
      System.out.println("[DETAIL] FOOD_CD direct scan miss. req=" + foodCd);
      System.out.println("[DETAIL] first FOOD_CD in xml=" + pick(xml, "FOOD_CD"));
      System.out.println("[DETAIL] first NAME in xml=" + pick(xml, "FOOD_NM_KR"));

    } catch (Exception e) {
      System.out.println("[DETAIL] direct FOOD_CD lookup error: " + e.getMessage());
    }

    // ✅ 2) fallback: name이 있으면 name 검색으로 여러 페이지 뒤져서 foodCd 매칭
    if (name == null || name.isBlank()) return null;

    final int size = 100;
    final int maxPages = 30;

    for (int p = 1; p <= maxPages; p++) {
      String xml = client.searchXml(name, p, size);
      FoodDetailDto dto = parseDetailByFoodCd(xml, foodCd);
      if (dto != null) return dto;

      if (countItems(xml) < size) break;
    }

    return null;
  }

  // ---------------- XML helpers ----------------

  private static String pick(String xml, String tag) {
    if (xml == null) return "(xml is null)";
    String open = "<" + tag + ">";
    String close = "</" + tag + ">";
    int s = xml.indexOf(open);
    int e = xml.indexOf(close);
    if (s < 0 || e < 0 || e <= s) return "(not found)";
    return xml.substring(s + open.length(), e).trim();
  }

  private static Document toXmlDoc(String xml) {
    try {
      DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
      f.setNamespaceAware(false);
      f.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      return f.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    } catch (Exception e) {
      throw new RuntimeException("XML parse error", e);
    }
  }

  private static String text(Element el, String tag) {
    NodeList nl = el.getElementsByTagName(tag);
    if (nl.getLength() == 0) return null;
    String v = nl.item(0).getTextContent();
    return v == null ? null : v.trim();
  }

  private static Double parseNum(String s) {
    if (s == null) return null;
    s = s.trim();
    if (s.isEmpty()) return null;
    s = s.replace(",", "");
    try { return Double.parseDouble(s); }
    catch (Exception e) { return null; }
  }

  private static int parseIntSafe(String s, int def) {
    try {
      if (s == null) return def;
      s = s.trim();
      if (s.isEmpty()) return def;
      return Integer.parseInt(s);
    } catch (Exception e) {
      return def;
    }
  }

  private static int parseTotalCount(String xml) {
    Document doc = toXmlDoc(xml);
    NodeList nl = doc.getElementsByTagName("totalCount");
    if (nl.getLength() == 0) return 0;
    return parseIntSafe(nl.item(0).getTextContent(), 0);
  }

  private static int countItems(String xml) {
    Document doc = toXmlDoc(xml);
    return doc.getElementsByTagName("item").getLength();
  }

  private static List<FoodSummaryDto> parseSummaries(String xml) {
    Document doc = toXmlDoc(xml);
    NodeList items = doc.getElementsByTagName("item");

    List<FoodSummaryDto> list = new ArrayList<>();
    for (int i = 0; i < items.getLength(); i++) {
      Element it = (Element) items.item(i);

      FoodSummaryDto dto = new FoodSummaryDto();
      dto.setFoodCd(text(it, "FOOD_CD"));
      dto.setName(text(it, "FOOD_NM_KR"));
      dto.setServingSize(text(it, "SERVING_SIZE"));

      list.add(dto);
    }
    return list;
  }

  // ✅ 핵심: xml 안의 item들을 돌면서 FOOD_CD가 target과 같은 item을 찾는다
  private static FoodDetailDto parseDetailByFoodCd(String xml, String targetFoodCd) {
    Document doc = toXmlDoc(xml);
    NodeList items = doc.getElementsByTagName("item");
    for (int i = 0; i < items.getLength(); i++) {
      Element it = (Element) items.item(i);
      String cd = text(it, "FOOD_CD");
      if (targetFoodCd.equals(cd)) {
        return toDetailDto(it);
      }
    }
    return null;
  }

  private static FoodDetailDto toDetailDto(Element it) {
    FoodDetailDto dto = new FoodDetailDto();
    dto.setFoodCd(text(it, "FOOD_CD"));
    dto.setName(text(it, "FOOD_NM_KR"));
    dto.setServingSize(text(it, "SERVING_SIZE"));

    dto.setKcal(parseNum(text(it, "AMT_NUM1")));
    dto.setProtein(parseNum(text(it, "AMT_NUM3")));
    dto.setFat(parseNum(text(it, "AMT_NUM4")));
    dto.setCarb(parseNum(text(it, "AMT_NUM6")));
    dto.setSugar(parseNum(text(it, "AMT_NUM7")));
    dto.setSodium(parseNum(text(it, "AMT_NUM13")));
    dto.setSatFat(parseNum(text(it, "AMT_NUM24")));

    return dto;
  }
}



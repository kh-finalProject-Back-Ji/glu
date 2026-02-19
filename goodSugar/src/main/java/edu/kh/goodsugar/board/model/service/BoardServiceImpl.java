package edu.kh.goodsugar.board.model.service;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.board.model.dto.BoardImageDto;
import edu.kh.goodsugar.board.model.dto.CommentDto;
import edu.kh.goodsugar.board.model.dto.RecommendDetailDto;
import edu.kh.goodsugar.board.model.dto.SnackDetailDto;
import edu.kh.goodsugar.board.model.dto.request.BoardCreateReq;
import edu.kh.goodsugar.board.model.dto.request.BoardListReq;
import edu.kh.goodsugar.board.model.dto.request.CommentCreateReq;
import edu.kh.goodsugar.board.model.dto.response.BoardDetailRes;
import edu.kh.goodsugar.board.model.dto.response.BoardListItemRes;
import edu.kh.goodsugar.board.model.dto.response.CommentRes;
import edu.kh.goodsugar.board.model.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

  private final BoardMapper mapper;

  private long typeToId(String type) {
    if (type == null) return 2L;
    return switch (type.toUpperCase()) {
      case "SNACK" -> 1L;
      case "FREE" -> 2L;
      case "RECOMMEND" -> 3L;
      default -> 2L;
    };
  }

  @Override
  public Map<String, Object> getBoardList(BoardListReq req) {
    long boardTypeId = typeToId(req.getType());

    int page = Math.max(req.getPage(), 1);
    int size = Math.min(Math.max(req.getSize(), 1), 50);
    int offset = (page - 1) * size;

    Map<String, Object> param = new HashMap<>();
    param.put("boardTypeId", boardTypeId);
    param.put("q", req.getQ());
    param.put("status", req.getStatus());
    param.put("sort", req.getSort() == null ? "latest" : req.getSort());
    param.put("offset", offset);
    param.put("size", size);

    int total = mapper.selectBoardListCount(param);
    List<BoardListItemRes> items = mapper.selectBoardList(param);

    Map<String, Object> res = new HashMap<>();
    res.put("page", page);
    res.put("size", size);
    res.put("total", total);
    res.put("items", items);
    return res;
  }

  @Override
  @Transactional
  public BoardDetailRes getBoardDetail(long boardId, Long loginMemberId) {
    mapper.increaseViewCount(boardId);

    BoardDetailRes detail = mapper.selectBoardDetail(boardId);
    if (detail == null) return null;

    if (detail.getBoardTypeId() == 1L) {
      detail.setSnack(mapper.selectSnackDetail(boardId));
    } else if (detail.getBoardTypeId() == 3L) {
      detail.setRecommend(mapper.selectRecommendDetail(boardId));
    }

    detail.setImages(mapper.selectBoardImages(boardId));

    boolean liked = false;
    if (loginMemberId != null) {
      liked = mapper.selectLikeExists(boardId, loginMemberId) > 0;
    }
    detail.setLikedByMe(liked);

    return detail;
  }

  @Override
  @Transactional
  public long createBoard(long memberId, BoardCreateReq req, List<String> imageUrls) {
    long boardId = mapper.selectBoardNextId();

    Map<String, Object> p = new HashMap<>();
    p.put("boardId", boardId);
    p.put("boardTypeId", req.getBoardTypeId());
    p.put("title", req.getTitle());
    p.put("content", req.getContent());
    p.put("isAnonymousYn", req.getIsAnonymousYn() == null ? "N" : req.getIsAnonymousYn());
    p.put("memberId", memberId);

    mapper.insertBoard(p);

    // 타입별 상세
    if (req.getBoardTypeId() == 1L) {
      SnackDetailDto s = new SnackDetailDto();
      s.setBoardId(boardId);
      s.setUseMedicationYn(req.getUseMedicationYn());
      s.setUseInjectionYn(req.getUseInjectionYn());
      s.setGlucoseType(req.getGlucoseType());
      s.setGlucoseValue(req.getGlucoseValue());
      s.setMeasureTime(req.getMeasureTime());
      s.setMeasureType(req.getMeasureType());
      s.setSnackType(req.getSnackType());
      s.setEatStatus(req.getEatStatus());
      s.setTasteScore(req.getTasteScore());
      s.setHealthScore(req.getHealthScore());
      mapper.insertSnackDetail(s);
    } else if (req.getBoardTypeId() == 3L) {
      RecommendDetailDto r = new RecommendDetailDto();
      r.setBoardId(boardId);
      r.setPlaceName(req.getPlaceName());
      r.setAddress(req.getAddress());
      r.setLatitude(req.getLatitude());
      r.setLongitude(req.getLongitude());
      r.setFoodName(req.getFoodName());
      r.setDiabeticReason(req.getDiabeticReason());
      r.setMapProvider(req.getMapProvider());
      r.setPlaceUrl(req.getPlaceUrl());
      mapper.insertRecommendDetail(r);
    }

    // 글 익명(Y) -> 익명1 고정
    if ("Y".equalsIgnoreCase((String)p.get("isAnonymousYn"))) {
      if (mapper.selectAnonNo(boardId, memberId) == null) {
        mapper.insertAnonMap(boardId, memberId, 1);
      }
    }

    // 이미지 메타 저장(실제 업로드는 프론트/파일서비스에서 URL 만든 후 넘긴다고 가정)
    if (imageUrls != null) {
      int sort = 1;
      for (String url : imageUrls) {
        BoardImageDto img = new BoardImageDto();
        img.setBoardId(boardId);
        img.setImageUrl(url);
        img.setSortOrder(sort++);
        mapper.insertBoardImage(img);
      }
    }

    return boardId;
  }

  @Override
  @Transactional
  public boolean updateBoard(long boardId, long memberId, BoardCreateReq req, List<String> imageUrls) {
    Map<String, Object> p = new HashMap<>();
    p.put("boardId", boardId);
    p.put("memberId", memberId);
    p.put("title", req.getTitle());
    p.put("content", req.getContent());
    p.put("isAnonymousYn", req.getIsAnonymousYn() == null ? "N" : req.getIsAnonymousYn());

    int updated = mapper.updateBoard(p);
    if (updated == 0) return false;

    if (req.getBoardTypeId() == 1L) {
      SnackDetailDto s = new SnackDetailDto();
      s.setBoardId(boardId);
      s.setUseMedicationYn(req.getUseMedicationYn());
      s.setUseInjectionYn(req.getUseInjectionYn());
      s.setGlucoseType(req.getGlucoseType());
      s.setGlucoseValue(req.getGlucoseValue());
      s.setMeasureTime(req.getMeasureTime());
      s.setMeasureType(req.getMeasureType());
      s.setSnackType(req.getSnackType());
      s.setEatStatus(req.getEatStatus());
      s.setTasteScore(req.getTasteScore());
      s.setHealthScore(req.getHealthScore());
      mapper.updateSnackDetail(s);
    } else if (req.getBoardTypeId() == 3L) {
      RecommendDetailDto r = new RecommendDetailDto();
      r.setBoardId(boardId);
      r.setPlaceName(req.getPlaceName());
      r.setAddress(req.getAddress());
      r.setLatitude(req.getLatitude());
      r.setLongitude(req.getLongitude());
      r.setFoodName(req.getFoodName());
      r.setDiabeticReason(req.getDiabeticReason());
      r.setMapProvider(req.getMapProvider());
      r.setPlaceUrl(req.getPlaceUrl());
      mapper.updateRecommendDetail(r);
    }

    // 익명으로 바뀌면 익명1 매핑 보장(작성자)
    if ("Y".equalsIgnoreCase((String)p.get("isAnonymousYn"))) {
      if (mapper.selectAnonNo(boardId, memberId) == null) mapper.insertAnonMap(boardId, memberId, 1);
    }

    // 이미지 갱신: 간단히 전체 삭제 후 재삽입
    mapper.deleteBoardImages(boardId);
    if (imageUrls != null) {
      int sort = 1;
      for (String url : imageUrls) {
        BoardImageDto img = new BoardImageDto();
        img.setBoardId(boardId);
        img.setImageUrl(url);
        img.setSortOrder(sort++);
        mapper.insertBoardImage(img);
      }
    }

    return true;
  }

  @Override
  @Transactional
  public boolean deleteBoard(long boardId, long memberId) {
    return mapper.softDeleteBoard(boardId, memberId) > 0;
  }

  @Override
  @Transactional
  public Map<String, Object> toggleLike(long boardId, long memberId) {
    boolean liked;
    if (mapper.selectLikeExists(boardId, memberId) > 0) {
      mapper.deleteLike(boardId, memberId);
      liked = false;
    } else {
      mapper.insertLike(boardId, memberId);
      liked = true;
    }
    int likeCount = mapper.selectLikeCount(boardId);

    Map<String, Object> res = new HashMap<>();
    res.put("liked", liked);
    res.put("likeCount", likeCount);
    return res;
  }

  @Override
  public List<CommentRes> getComments(long boardId) {
    List<CommentDto> flat = mapper.selectCommentsFlat(boardId);

    Map<Long, CommentRes> map = new LinkedHashMap<>();
    for (CommentDto c : flat) {
      CommentRes r = new CommentRes();
      r.setCommentId(c.getCommentId());
      r.setParentCommentId(c.getParentCommentId());
      r.setDeleteFl(c.getDeleteFl());
      r.setCreatedAt(c.getCreateDate());
      r.setUpdatedAt(c.getUpdateDate());

      if ("Y".equalsIgnoreCase(c.getDeleteFl())) r.setContent("삭제된 댓글입니다.");
      else r.setContent(c.getCommentContent());

      r.setWriterName(c.getWriterName());
      r.setWriterProfileImg(c.getWriterProfileImg());
      r.setWriterMemberId(c.getWriterMemberId());
      map.put(r.getCommentId(), r);
    }

    List<CommentRes> roots = new ArrayList<>();
    for (CommentRes r : map.values()) {
      if (r.getParentCommentId() == null) roots.add(r);
      else {
        CommentRes parent = map.get(r.getParentCommentId());
        if (parent != null) parent.getChildren().add(r);
        else roots.add(r);
      }
    }
    return roots;
  }

  @Override
  @Transactional
  public void addComment(long boardId, long memberId, CommentCreateReq req) {
    String anon = req.getIsAnonymousYn() == null ? "N" : req.getIsAnonymousYn();

    if ("Y".equalsIgnoreCase(anon)) {
      Integer anonNo = mapper.selectAnonNo(boardId, memberId);
      if (anonNo == null) {
        int next = mapper.selectNextAnonNo(boardId);
        mapper.insertAnonMap(boardId, memberId, next);
      }
    }

    CommentDto dto = new CommentDto();
    dto.setBoardId(boardId);
    dto.setParentCommentId(req.getParentCommentId());
    dto.setMemberId(memberId);
    dto.setCommentContent(req.getContent());
    dto.setIsAnonymousYn(anon);

    mapper.insertComment(dto);
  }

  @Override
  @Transactional
  public boolean updateComment(long commentId, long memberId, String content) {
    return mapper.updateComment(commentId, memberId, content) > 0;
  }

  @Override
  @Transactional
  public boolean deleteComment(long commentId, long memberId) {
    return mapper.softDeleteComment(commentId, memberId) > 0;
  }
}

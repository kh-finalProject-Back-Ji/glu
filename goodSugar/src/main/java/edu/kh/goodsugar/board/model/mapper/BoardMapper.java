package edu.kh.goodsugar.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.goodsugar.board.model.dto.BoardImageDto;
import edu.kh.goodsugar.board.model.dto.CommentDto;
import edu.kh.goodsugar.board.model.dto.RecommendDetailDto;
import edu.kh.goodsugar.board.model.dto.SnackDetailDto;
import edu.kh.goodsugar.board.model.dto.response.BoardDetailRes;
import edu.kh.goodsugar.board.model.dto.response.BoardListItemRes;

@Mapper
public interface BoardMapper {

  // ===== Board ID =====
  Long selectBoardNextId();

  // ===== Board List/Count =====
  int selectBoardListCount(Map<String, Object> param);
  List<BoardListItemRes> selectBoardList(Map<String, Object> param);

  // ===== Board Detail =====
  BoardDetailRes selectBoardDetail(@Param("boardId") long boardId);
  SnackDetailDto selectSnackDetail(@Param("boardId") long boardId);
  RecommendDetailDto selectRecommendDetail(@Param("boardId") long boardId);
  List<BoardImageDto> selectBoardImages(@Param("boardId") long boardId);
  int increaseViewCount(@Param("boardId") long boardId);

  // ===== Board CRUD =====
  int insertBoard(Map<String, Object> param);
  int updateBoard(Map<String, Object> param);
  int softDeleteBoard(@Param("boardId") long boardId, @Param("memberId") long memberId);

  // ===== Type detail CRUD =====
  int insertSnackDetail(SnackDetailDto dto);
  int updateSnackDetail(SnackDetailDto dto);

  int insertRecommendDetail(RecommendDetailDto dto);
  int updateRecommendDetail(RecommendDetailDto dto);

  // ===== Images =====
  int insertBoardImage(BoardImageDto dto);
  int deleteBoardImages(@Param("boardId") long boardId);

  // ===== Like =====
  int selectLikeExists(@Param("boardId") long boardId, @Param("memberId") long memberId);
  int insertLike(@Param("boardId") long boardId, @Param("memberId") long memberId);
  int deleteLike(@Param("boardId") long boardId, @Param("memberId") long memberId);
  int selectLikeCount(@Param("boardId") long boardId);

  // ===== Comment =====
  List<CommentDto> selectCommentsFlat(@Param("boardId") long boardId);
  int insertComment(CommentDto dto);
  int updateComment(@Param("commentId") long commentId, @Param("memberId") long memberId, @Param("content") String content);
  int softDeleteComment(@Param("commentId") long commentId, @Param("memberId") long memberId);

  // ===== Anonymous Map (익명1~N) =====
  Integer selectAnonNo(@Param("boardId") long boardId, @Param("memberId") long memberId);
  Integer selectNextAnonNo(@Param("boardId") long boardId);
  int insertAnonMap(@Param("boardId") long boardId, @Param("memberId") long memberId, @Param("anonNo") int anonNo);
}

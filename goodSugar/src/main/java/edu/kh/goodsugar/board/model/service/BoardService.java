package edu.kh.goodsugar.board.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.goodsugar.board.model.dto.request.BoardCreateReq;
import edu.kh.goodsugar.board.model.dto.request.BoardListReq;
import edu.kh.goodsugar.board.model.dto.request.CommentCreateReq;
import edu.kh.goodsugar.board.model.dto.response.BoardDetailRes;
import edu.kh.goodsugar.board.model.dto.response.CommentRes;

public interface BoardService {

  Map<String, Object> getBoardList(BoardListReq req);

  BoardDetailRes getBoardDetail(long boardId, Long loginMemberId);

  long createBoard(long memberId, BoardCreateReq req, List<String> imageUrls);

  boolean updateBoard(long boardId, long memberId, BoardCreateReq req, List<String> imageUrls);

  boolean deleteBoard(long boardId, long memberId);

  Map<String, Object> toggleLike(long boardId, long memberId);

  List<CommentRes> getComments(long boardId);

  void addComment(long boardId, long memberId, CommentCreateReq req);

  boolean updateComment(long commentId, long memberId, String content);

  boolean deleteComment(long commentId, long memberId);
}

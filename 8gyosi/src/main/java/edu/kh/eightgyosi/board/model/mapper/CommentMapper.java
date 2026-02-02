package edu.kh.eightgyosi.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import edu.kh.eightgyosi.board.model.dto.BoardComment;
import edu.kh.eightgyosi.member.model.dto.Member;

@Mapper
public interface CommentMapper {

    List<BoardComment> selectCommentList(int boardId);
    int insertComment(BoardComment comment);
    int deleteComment(Map<String, Object> map);
    BoardComment selectComment(int commentId);
    
	List<BoardComment> select(int boardId);
	int insert(BoardComment comment);
	int delete(int commentNo);
	int update(BoardComment comment);
	int updateComment(BoardComment comment);
	
}
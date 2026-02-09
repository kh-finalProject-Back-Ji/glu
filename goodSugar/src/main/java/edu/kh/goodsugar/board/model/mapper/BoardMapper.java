package edu.kh.goodsugar.board.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.goodsugar.board.model.dto.Board;

@Mapper
public interface BoardMapper {

	List<Board> selectBoardList();
	
}

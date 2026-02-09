package edu.kh.goodsugar.board.model.service;

import java.util.List;

import edu.kh.goodsugar.board.model.dto.Board;

public interface BoardService {

	List<Board> selectBoardList();
	
	List<Board> selectSnackList();

}

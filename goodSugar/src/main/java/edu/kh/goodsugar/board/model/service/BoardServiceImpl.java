package edu.kh.goodsugar.board.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.board.model.dto.Board;
import edu.kh.goodsugar.board.model.mapper.BoardMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class BoardServiceImpl implements BoardService {

	@Autowired
	private BoardMapper mapper;
	
	@Override
	public List<Board> selectBoardList() {
		return mapper.selectBoardList();
	}

}

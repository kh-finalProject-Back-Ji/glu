package edu.kh.goodsugar.board.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.board.model.mapper.BoardMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class BoardServiceImpl {
	
	@Autowired
	private BoardMapper mapper;

}

package edu.kh.goodsugar.board.controller;


import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.board.model.dto.Board;
import edu.kh.goodsugar.board.model.service.BoardService;



@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // React 개발 서버 주소
public class BoardController {

	private final BoardService service;
	
	@GetMapping("")
	public List<Board> selectBoardList(@RequestParam(value="type", required=false, defaultValue="free") String type) {
	    
	    // 1. type이 "snack"이면 간식 게시판(Type 2) 조회
	    if("snack".equals(type)) {
	        return service.selectSnackList();
	    }
	    
	    // 2. 그 외(기본값 "free" 등)는 자유 게시판(Type 1) 조회
	    // 이제 selectBoardList는 SQL에서 Type 1만 가져오도록 되어 있습니다.
	    return service.selectBoardList();
	}
	
	@PostMapping("")
	public int insertBoard(@RequestBody Board board) {
	    if(board.getMemberId() == 0) board.setMemberId(1); 
	    
	    return service.insertBoard(board);
	}
	
}

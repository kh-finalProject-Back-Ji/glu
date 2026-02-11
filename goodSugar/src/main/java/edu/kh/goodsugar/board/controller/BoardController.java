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
    public List<Board> selectBoardList(@RequestParam(value="type", required=false) String type) {
        if("snack".equals(type)) return service.selectSnackList();
        //if("good".equals(type)) return service.selectGoodList();
		return service.selectBoardList();
        
    }
	
	@PostMapping("")
	public int insertBoard(@RequestBody Board board) {
	    if(board.getMemberId() == 0) board.setMemberId(1); 
	    
	    return service.insertBoard(board);
	}
	
}

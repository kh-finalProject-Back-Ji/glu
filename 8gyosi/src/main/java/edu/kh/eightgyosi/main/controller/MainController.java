package edu.kh.eightgyosi.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardType;
import edu.kh.eightgyosi.board.model.service.BoardService;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class MainController {

	@Autowired
	private BoardService service;
	
	@RequestMapping("/")
	public String mainPage(Model model){
		
		List<BoardType> boardTypeList = service.selectBoardType();
		List<Board> boardTop5List = service.selectBoardTop5List();
		
		model.addAttribute("boardTypeList", boardTypeList);
		model.addAttribute("boardTop5List", boardTop5List);
		
		return "common/main"; // forward
	}
	
	/** @author dasol
	 * LoginFilter 에서 로그인하지 않았을 때 리다이렉트로 요청
	 */
	@GetMapping("loginError")
	public String loginError(RedirectAttributes ra) {
		
		ra.addFlashAttribute("message", "로그인 후 이용해 주세요");
		return "redirect:/";
	}
	
	
	
}

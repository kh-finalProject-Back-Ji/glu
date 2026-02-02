package edu.kh.eightgyosi.board.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardImage;
import edu.kh.eightgyosi.board.model.service.BoardService;
import edu.kh.eightgyosi.board.model.service.EditBoardService;
import edu.kh.eightgyosi.member.model.dto.Member;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RequestMapping("board")
public class BoardController {

	@Autowired
	private BoardService service;
	@Autowired
	private EditBoardService editService;
	
	
	@GetMapping("{boardTypeNo:[0-9]+}")
	public String selectBoardList(@PathVariable("boardTypeNo") int boardTypeNo,
			@RequestParam(value = "cp", required = false, defaultValue = "1") int cp, Model model,
			@RequestParam Map<String, Object> paramMap) {

		Map<String, Object> map = null;

		// 검색이 아닌 경우 --> 
		if(paramMap.get("key") == null) {
			map = service.selectBoardList(boardTypeNo, cp);
		} else { // 검색인 경우(검색한 게시글 목록 조회)
			paramMap.put("boardTypeNo", boardTypeNo);
			// -> paramMap은 {key=w, query=짱구, boardCode=1}
			// 검색(내가 검색하고 싶은 게시글 목록 조회) 서비스 호출
			map = service.searchList(paramMap, cp);
		}

		// model에 결과 값 등록
		model.addAttribute("pagination", map.get("pagination"));
		model.addAttribute("boardList", map.get("boardList"));

		log.debug("boardTypeNo :: {}, pagination :: {}", boardTypeNo, map.get("pagination"));

		return "board/boardList";
	}

	/** 게시글 상세 조회 BOARD CONTROLLER
	 * 공지사항(boardTypeNo==6)도 조회 가능
	 */
	@GetMapping("{boardTypeNo:[0-9]+}/{boardId:[0-9]+}")
	public String BoardDetail(@PathVariable("boardTypeNo") int boardTypeNo,
							@PathVariable("boardId") int boardId,
							@SessionAttribute(value = "loginMember", required = false) Member loginMember,
							Model model,
							RedirectAttributes ra,
							HttpServletRequest req,
							HttpServletResponse resp) {

		Map<String, Object> map = new HashMap<>();
		map.put("boardTypeNo", boardTypeNo);
		map.put("boardId", boardId);

		if(loginMember != null) {
			map.put("memberNo", loginMember.getMemberNo());
		}
		
		Board board = service.selectOne(map);
		
		String path = null;

		if(board == null) {
			// 게시글이 없을 경우
			path = "redirect:/board/" + boardTypeNo;
			ra.addFlashAttribute("message", "게시글이 존재하지 않습니다.");
		} else {
			// 조회수 처리 (본인 글은 조회수 증가 X)
			if(loginMember == null || board.getMemberNo() != loginMember.getMemberNo()) {

				Cookie[] cookies = req.getCookies();
				Cookie c = null;

				if(cookies != null) {
					for(Cookie temp : cookies) {
						if(temp.getName().equals("readBoardId")) {
							c = temp;
							break;
						}
					}
				}

				int result = 0;

				if(c == null) {
					// 쿠키 없으면 새로 생성
					c = new Cookie("readBoardId", "[" + boardId + "]");
					result = service.updateReadCount(boardId);
				} else if (c.getValue().indexOf("[" + boardId + "]") == -1) {
					// 쿠키에 없으면 조회수 증가
					c.setValue(c.getValue() + "[" + boardId + "]");
					result = service.updateReadCount(boardId);
				}

				if(result > 0) {
					// 조회수 업데이트
					board.setBoardViewCount(result);

					// 쿠키 적용 경로 설정
					c.setPath("/");

					// 쿠키 만료: 다음날 자정까지
					LocalDateTime now = LocalDateTime.now();
					LocalDateTime nextDayMidnight = now.plusDays(1)
							.withHour(0).withMinute(0).withSecond(0).withNano(0);
					long secondsUntilNextDay = Duration.between(now, nextDayMidnight).getSeconds();
					c.setMaxAge((int)secondsUntilNextDay);

					resp.addCookie(c);
				}
			}

			path = "board/boardDetail";

			// 첨부파일 조회
			board.setBoardFiles(editService.selectBoardFiles(boardId));

			// 이미지 조회
			board.setBoardImages(editService.selectBoardImages(boardId));

			// 모델에 게시글 등록
			model.addAttribute("board", board);

			// 썸네일 처리
			if(!board.getBoardImages().isEmpty()) {
				BoardImage thumbnail = null;
				if(board.getBoardImages().get(0).getImgOrder() == 0) {
					thumbnail = board.getBoardImages().get(0);
				}
				model.addAttribute("thumbnail", thumbnail);
				model.addAttribute("start", thumbnail != null ? 1 : 0);
			}
		}

		return path;
	}

	/** 게시글 좋아요 처리 BOARD CONTROLLER
	 * @param map {boardId, memberNo}
	 * @return 현재 좋아요 수
	 */
	@ResponseBody
	@PostMapping("like") //  /board/like (POST) 요청 매핑
	public int boardLike(@RequestBody Map<String, Integer> map) {
		return service.boardLike(map);
	}
}


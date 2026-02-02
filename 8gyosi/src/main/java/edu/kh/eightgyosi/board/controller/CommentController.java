package edu.kh.eightgyosi.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import edu.kh.eightgyosi.board.model.dto.BoardComment;
import edu.kh.eightgyosi.board.model.service.CommentService;
import edu.kh.eightgyosi.member.model.dto.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/editBoard/comment")
@Slf4j
@RequiredArgsConstructor
public class CommentController {

    private final CommentService service;

    /** ===================== 댓글/대댓글 목록 조회 ===================== */
    @GetMapping("/{boardId}")
    public ResponseEntity<List<BoardComment>> getCommentList(@PathVariable("boardId") int boardId) {
        List<BoardComment> commentList = service.selectCommentList(boardId);
        return ResponseEntity.ok(commentList);
    }

    /** ===================== 댓글/대댓글 작성 ===================== */
    @PostMapping("/{boardId}")
    public ResponseEntity<Map<String,Object>> insertComment(@PathVariable("boardId") int boardId,
                                                            @RequestBody BoardComment comment,
                                                            @SessionAttribute("loginMember") Member loginMember) {
        // 로그인한 회원 정보 세팅
        comment.setMemberNo(loginMember.getMemberNo());
        comment.setBoardId(boardId);
        
        log.debug("BoardComment :: {}", comment);

        int result = service.insertComment(comment);
        return ResponseEntity.ok(
            Map.of("success", result > 0,
                   "message", result > 0 ? "댓글 작성 완료" : "작성 실패")
        );
    }

    /** ===================== 댓글/대댓글 삭제 ===================== */
    @DeleteMapping("/{boardId}/{commentNo}")
    public ResponseEntity<Map<String,Object>> deleteComment(@PathVariable("boardId") int boardId,
    														@PathVariable("commentNo") int commentNo,  
                                                            @SessionAttribute("loginMember") Member loginMember) {

        int result = service.deleteComment(commentNo, loginMember);
        List<BoardComment> commentList = service.selectCommentList(boardId); // 삭제 후 댓글 목록 반환
        log.debug("result :: {}", result);
        return ResponseEntity.status(result > 0 ? HttpStatus.OK : HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "success", result > 0,
                        "message", result > 0 ? "댓글 삭제 완료" : "권한 없음 또는 댓글이 존재하지 않습니다.",
                        "commentList", commentList
                ));
    }
    
	@GetMapping("")
	public List<BoardComment> select(@RequestParam("boardId") int boardId) {
		return service.select(boardId);
	}
	
	
	@PostMapping("")
	public int insert(@RequestBody BoardComment comment) {
		return service.insert(comment);
	}
	

	@DeleteMapping("")
	public int delete(@RequestBody int commentNo) {
		return service.delete(commentNo);
	}
	

	@PutMapping("")
	public ResponseEntity<Map<String, Object>> updateComment(@RequestBody BoardComment comment) {
	    
	    int result = service.updateComment(comment);
	    
	    return ResponseEntity.ok(
	        Map.of("success", result > 0)
	    );
	}
	
}
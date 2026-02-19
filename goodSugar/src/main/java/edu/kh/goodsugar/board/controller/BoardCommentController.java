package edu.kh.goodsugar.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.board.model.dto.request.CommentCreateReq;
import edu.kh.goodsugar.board.model.dto.response.CommentRes;
import edu.kh.goodsugar.board.model.service.BoardService;
import edu.kh.goodsugar.common.util.AuthUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BoardCommentController {

    private final BoardService service;

    /**
     * 댓글 목록 (비로그인 허용)
     * - 삭제된 댓글은 service에서 "삭제된 댓글입니다." 처리됨
     * - 대댓글은 children으로 묶여서 내려옴
     */
    @GetMapping("/api/boards/{boardId}/comments")
    public ResponseEntity<List<CommentRes>> list(@PathVariable long boardId) {
        return ResponseEntity.ok(service.getComments(boardId));
    }

    /**
     * 댓글 작성 (로그인 필수)
     * - 대댓글: parentCommentId 넣어서 호출
     * - 익명: isAnonymousYn="Y"
     */
    @PostMapping("/api/boards/{boardId}/comments")
    public ResponseEntity<?> add(@PathVariable long boardId,
                                 @RequestBody CommentCreateReq req,
                                 Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        service.addComment(boardId, memberId, req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 댓글 수정 (로그인 필수 / 작성자만)
     * body: { "content": "..." }
     */
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<?> update(@PathVariable long commentId,
                                    @RequestBody Map<String, String> body,
                                    Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "CONTENT_REQUIRED"));
        }

        boolean ok = service.updateComment(commentId, memberId, content);
        if (!ok) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN_OR_NOT_FOUND"));

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 댓글 삭제 (로그인 필수 / 작성자만) - soft delete
     */
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<?> delete(@PathVariable long commentId, Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        boolean ok = service.deleteComment(commentId, memberId);
        if (!ok) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN_OR_NOT_FOUND"));

        return ResponseEntity.ok(Map.of("success", true));
    }
}

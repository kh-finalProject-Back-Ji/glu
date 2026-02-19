package edu.kh.goodsugar.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.board.model.dto.request.BoardCreateReq;
import edu.kh.goodsugar.board.model.dto.request.BoardListReq;
import edu.kh.goodsugar.board.model.dto.response.BoardDetailRes;
import edu.kh.goodsugar.board.model.service.BoardService;
import edu.kh.goodsugar.common.util.AuthUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService service;

    /**
     * 게시글 목록 (비로그인 허용)
     * - req: type(SNACK/FREE/RECOMMEND), q, status(간식일 때), sort, page, size
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(BoardListReq req) {
        return ResponseEntity.ok(service.getBoardList(req));
    }

    /**
     * 게시글 상세 (비로그인 허용)
     * - 로그인 시 likedByMe 계산
     */
    @GetMapping("/{boardId}")
    public ResponseEntity<?> detail(@PathVariable long boardId, Authentication auth) {

        Long memberId = AuthUtil.getMemberId(auth); // 비로그인 null

        BoardDetailRes res = service.getBoardDetail(boardId, memberId);
        if (res == null) {
            return ResponseEntity.status(404).body(Map.of("message", "NOT_FOUND"));
        }
        return ResponseEntity.ok(res);
    }

    /**
     * 게시글 작성 (로그인 필수)
     * - 이미지 URL 목록은 일단 빈 리스트로 처리하거나,
     *   프론트에서 URL 리스트를 넘겨주면 @RequestBody에 포함시키는 구조로 확장하면 됨
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BoardCreateReq req, Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        // TODO: 이미지 업로드/URL 처리 붙이기 전까지는 빈 리스트
        long boardId = service.createBoard(memberId, req, List.of());

        return ResponseEntity.ok(Map.of("boardId", boardId));
    }

    /**
     * 게시글 수정 (로그인 필수 / 작성자만 성공)
     */
    @PutMapping("/{boardId}")
    public ResponseEntity<?> update(@PathVariable long boardId,
                                    @RequestBody BoardCreateReq req,
                                    Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        boolean ok = service.updateBoard(boardId, memberId, req, List.of());
        if (!ok) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN_OR_NOT_FOUND"));

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 게시글 삭제 (로그인 필수 / 작성자만 성공) - soft delete
     */
    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> delete(@PathVariable long boardId, Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        boolean ok = service.deleteBoard(boardId, memberId);
        if (!ok) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN_OR_NOT_FOUND"));

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 좋아요 토글 (로그인 필수)
     * return: { liked: true/false, likeCount: n }
     */
    @PostMapping("/{boardId}/likes")
    public ResponseEntity<?> toggleLike(@PathVariable long boardId, Authentication auth) {

        long memberId = AuthUtil.requireMemberId(auth);

        Map<String, Object> res = service.toggleLike(boardId, memberId);
        return ResponseEntity.ok(res);
    }
}

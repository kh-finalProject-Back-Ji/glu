package edu.kh.eightgyosi.board.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.board.model.dto.BoardComment;
import edu.kh.eightgyosi.board.model.mapper.CommentMapper;
import edu.kh.eightgyosi.member.model.dto.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentMapper mapper;

    /** ===================== 댓글/대댓글 목록 조회 ===================== */
    @Override
    public List<BoardComment> selectCommentList(int boardId) {
        try {
            // DB에서 해당 게시글 댓글 전체 조회 (parentCommentNo 포함)
            return mapper.selectCommentList(boardId);
        } catch (Exception e) {
            log.error("댓글 목록 조회 중 오류", e);
            throw new RuntimeException("댓글 목록 조회 중 예외 발생: " + e.getMessage(), e);
        }
    }
	@Override
	public int deleteComment(int commentNo, Member loginMember) {
		Map<String, Object> map = new HashMap<>();
	    map.put("commentNo", commentNo);
	    map.put("memberNo", loginMember.getMemberNo());
	    
	    return mapper.deleteComment(map); 
}
    /** ===================== 댓글/대댓글 작성 ===================== */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertComment(BoardComment comment) {
        try {
            // parentCommentNo가 null이면 일반 댓글, 값이 있으면 대댓글
            return mapper.insertComment(comment);
        } catch (Exception e) {
            log.error("댓글 작성 중 오류", e);
            throw new RuntimeException("댓글 작성 중 예외 발생: " + e.getMessage(), e);
        }
    }
    
	@Override
	public List<BoardComment> select(int boardId) {
		// TODO Auto-generated method stub
		return mapper.select(boardId);
	}

	@Override
	public int insert(BoardComment comment) {
		// TODO Auto-generated method stub
		return mapper.insert(comment);
	}

	@Override
	public int delete(int commentNo) {
		// TODO Auto-generated method stub
		return mapper.delete(commentNo);
	}

	@Override
	public int update(BoardComment comment) {
		// TODO Auto-generated method stub
		return mapper.update(comment);
	}
	@Override
	public int updateComment(BoardComment comment) {
		// TODO Auto-generated method stub
		return mapper.updateComment(comment);
	}

     /*/ ===================== 댓글/대댓글 삭제 ===================== 
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteComment(int commentId, Member loginMember) {
        try {
            // 댓글 작성자 확인
            BoardComment comment = mapper.selectCommentById(commentId);
            if(comment == null) return 0; // 댓글 없음

            if(comment.getMemberNo() != loginMember.getMemberNo() 
               && !"ADMIN".equals(loginMember.getRole())) {
                return 0; // 권한 없음
            }

            // 삭제 처리
            return mapper.deleteComment(commentId);
        } catch (Exception e) {
            log.error("댓글 삭제 중 오류", e);
            throw new RuntimeException("댓글 삭제 중 예외 발생: " + e.getMessage(), e);
        }
    }*/
}
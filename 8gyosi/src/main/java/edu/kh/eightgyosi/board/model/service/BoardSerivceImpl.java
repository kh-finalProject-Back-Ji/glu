package edu.kh.eightgyosi.board.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardType;
import edu.kh.eightgyosi.board.model.dto.Pagination;
import edu.kh.eightgyosi.board.model.mapper.BoardMapper;

@Service
@Transactional(rollbackFor = Exception.class)

public class BoardSerivceImpl implements BoardService{
	
	@Autowired
	private BoardMapper mapper;
	
	
	/** 게시판 종류 조회 서비스
	 *
	 */
	@Override
	public List<Map<String, Object>> selectBoardTypeList() {
			return mapper.selectBoardTypeList();
	}
	
	// 게시판별 게시판 목록 조회
	@Override
	public Map<String, Object> selectBoardList(int boardTypeNo, int cp) {

		int listCount = mapper.getListCount(boardTypeNo);
		
		Pagination pagination = new Pagination(cp, listCount);
		
		
		int limit = pagination.getLimit(); // 10개
		int offset = (cp -1 ) * limit;
		RowBounds rowBounds = new RowBounds(offset, limit);
		
		List<Board> boardList = mapper.selectBoardList(boardTypeNo, rowBounds);
		
		Map<String, Object> map = new HashMap<>();
		map.put("pagination", pagination);
		map.put("boardList", boardList);
		
		// 5. map 반환
		return map;
		
	}

	@Override
	public Map<String, Object> searchList(Map<String, Object> paramMap, int cp) {
		
		// 1. 지정된 게시판(boardTypeNo)에서
		//    검색조건에 맞으면서
		// 	  삭제되지 않은 게시글 수를 조회
		int listCount = mapper.getSearchCount(paramMap);
		// 2. 1번의 결과 + cp 를 이용해서
		// Pagination 객체 생성
		Pagination pagination = new Pagination(cp, listCount);
		
		// 3. 특정 게시판의 지정된 페이지 목록 조회 (검색 포함)
		int limit = pagination.getLimit(); // 10개
		int offset = (cp - 1) * limit;
		RowBounds rowBounds = new RowBounds(offset, limit);
		
		List<Board> boardList = mapper.selectSearchList(paramMap, rowBounds);
		
		// 4. 검색 목록 조회 결과 + Pagination 객체를 Map으로 묶음
		Map<String, Object> map = new HashMap<>();
		map.put("pagination", pagination);
		map.put("boardList", boardList);
		
		// 5. 결과반환
		return map;

	}
	
	// 게시글 상세 조회
		@Override
		public Board selectOne(Map<String, Object> map) {
			return mapper.selectOne(map);
		}

		// 조회수 1증가
		@Override
		public int updateReadCount(int boardId) {
			
			int result = mapper.updateReadCount(boardId);

			if(result > 0) {
				return mapper.selectReadCount(boardId);
			}
					
			return -1;
		}

		@Override
		public int boardLike(Map<String, Integer> map) {
		    int result = 0;
		    System.out.println("전달된 map 내용: " + map);
		    if( map.get("likeCheck") == 1 ) {
				
				result = mapper.deleteBoardLike(map);
				
			} else {			
				result = mapper.insertBoardLike(map);
				
			}
			
			if(result > 0) {
				return mapper.selectLikeCount(map.get("boardId"));
			}
			
			return -1;
		}
		
		/**
		 * 메인 화면에 boardType 뿌려주기 위한 서비스
		 * - seongjong
		 */
		@Override
		public List<BoardType> selectBoardType() {
			return mapper.selectBoardType();
		}
		
		
		/**
		 * 메인 화면에 게시판별 top5 게시글 뿌려주기 위한 서비스
		 */
		@Override
		public List<Board> selectBoardTop5List() {
			return mapper.selectBoardTop5List();
		}

		@Override
		public Board selectBoardDetail(Map<String, Object> map) {
			return mapper.selectBoardDetail(map);
		}

}
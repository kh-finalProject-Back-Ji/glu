package edu.kh.eightgyosi.board.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardType;

public interface BoardService {

	/** 게시판 종류 조회 서비스
	 * @return
	 */
	List<Map<String, Object>> selectBoardTypeList();

	/** 게시판별 게시판 목록 조회 
	 * @param boardTypeNo(게시판 종류 번호)
	 * @param cp(현재 페이지)
	 * @return
	 */
	Map<String, Object> selectBoardList(int boardTypeNo, int cp);

	/** 검색 서비스( 게시판의 검색한 목록 조회)
	 * @param paramMap
	 * @param cp
	 * @return
	 */
	Map<String, Object> searchList(Map<String, Object> paramMap, int cp);
	
	/** 게시글 상세 조회 서비스
	 * @param map
	 * @return
	 */
	Board selectOne(Map<String, Object> map);

	/** 조회수 1 증가 서비스
	 * @param boardId
	 * @return
	 */
	int updateReadCount(int boardId);

	/** 게시글 좋아요 체크/해제 서비스
	 * @param paramMap
	 * @return
	 */
	int boardLike(Map<String, Integer> map);

	/** 메인화면에 boardTypeList 가져오기 위한 service
	 * @return
	 */
	List<BoardType> selectBoardType();

	List<Board> selectBoardTop5List();

	Board selectBoardDetail(Map<String, Object> map);

}
package edu.kh.goodsugar.board.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.board.model.dto.Board;
import edu.kh.goodsugar.board.model.mapper.BoardMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class BoardServiceImpl implements BoardService {

    @Autowired
    private BoardMapper mapper;
    
    @Override
    public List<Board> selectBoardList() {
        return mapper.selectBoardList();
    }

    @Override
    public List<Board> selectSnackList() {
        return mapper.selectSnackList();
    }

    /**
     * 게시글 + 간식 상세정보 등록
     */
    @Override
    public int insertBoard(Board board) {
        // 1. 공통 게시판(BOARD) 테이블에 먼저 삽입
        // 이 과정에서 XML의 useGeneratedKeys 덕분에 board.boardId에 PK값이 채워집니다.
        int result = mapper.insertBoard(board);
        
        // 2. 게시판 삽입 성공 시 간식 상세(SNACK) 테이블에 삽입
        if(result > 0) {
            // 위에서 채워진 boardId와 나머지 정보들을 사용해 SNACK 테이블에 넣습니다.
            result = mapper.insertSnack(board);
        }
        
        return result; // 최종적으로 SNACK 테이블 삽입 결과(1)를 반환
    }

    @Override
    public int insertSnack(Board board) {
        return mapper.insertSnack(board);
    }
}
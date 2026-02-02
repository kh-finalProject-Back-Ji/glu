package edu.kh.eightgyosi.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardFile;
import edu.kh.eightgyosi.board.model.dto.BoardImage;
import edu.kh.eightgyosi.board.model.dto.BoardType;

@Mapper
public interface EditBoardMapper {

    /** 게시글 작성 */
    int insertBoard(Board board);

    /** 게시글 수정 */
    int updateBoard(Board board);

    /** 게시글 삭제 */
    int deleteBoard(Map<String, Object> paramMap);

    /** 단일 게시글 조회 */
    Board selectBoardDetail(Map<String, Object> paramMap);

    /** 게시글 이미지 조회 */
    List<BoardImage> selectBoardImages(int boardId);

    /** 게시글 파일 조회 */
    List<BoardFile> selectBoardFiles(int boardId);

    /** 단일 이미지 조회 */
    BoardImage selectBoardImageById(int imgNo);

    /** 단일 파일 조회 */
    BoardFile selectBoardFile(int fileNo);

    /** 이미지 삽입 */
    int insertBoardImage(BoardImage boardImage);

    /** 이미지 삭제 */
    int deleteBoardImage(int imgNo);

    /** 파일 삽입 */
    int insertBoardFile(BoardFile boardFile);

    /** 파일 삭제 */
    int deleteBoardFile(int fileNo);

    /** 이미지 최대 순서 조회 */
    int selectMaxImgOrder(int boardId);

    /** 카테고리 조회 */
    List<BoardType> selectCategoryList();
}

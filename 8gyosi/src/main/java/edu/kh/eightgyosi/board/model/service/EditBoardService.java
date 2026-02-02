package edu.kh.eightgyosi.board.model.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardFile;
import edu.kh.eightgyosi.board.model.dto.BoardImage;
import edu.kh.eightgyosi.board.model.dto.BoardType;
import edu.kh.eightgyosi.member.model.dto.Member;

public interface EditBoardService {

    /** 게시글 작성 */
    int boardInsert(Board board, List<MultipartFile> images, List<MultipartFile> files) throws Exception;

    /** 게시글 수정 */
    int boardUpdate(Board board, List<MultipartFile> images, List<MultipartFile> files,
                    List<Integer> deleteImageList, List<Integer> deleteFileList) throws Exception;

    /** 게시글 삭제 */
    int boardDelete(int boardId, Member loginMember) throws Exception;

    /** 단일 게시글 조회 */
    Board selectBoard(int boardId);

    /** 게시글 이미지 조회 */
    List<BoardImage> selectBoardImages(int boardId);

    /** 게시글 파일 목록 조회 */
    List<BoardFile> selectBoardFiles(int boardId);

    /** 게시글 단일 파일 조회 (다운로드용) */
    BoardFile selectBoardFile(int fileId);

    /** Summernote 파일 업로드 */
    String uploadFile(MultipartFile file) throws Exception;

    /** 관리자 전용 카테고리 확인 */
    boolean isAdminOnlyCategory(int boardTypeNo);

    /** 게시판 카테고리 조회 */
    List<BoardType> getCategoryList();
}

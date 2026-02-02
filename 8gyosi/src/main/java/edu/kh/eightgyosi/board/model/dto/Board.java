package edu.kh.eightgyosi.board.model.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게시글 DTO
 * - board 테이블과 1:1 매핑
 * - 첨부 이미지/파일 리스트 포함
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Board {

    /** 게시글 번호 (PK) */
    private int boardId;

    /** 게시글 제목 */
    private String boardTitle;

    /** 게시글 내용 */
    private String boardContent;

    /** 게시글 조회수 */
    private int boardViewCount;

    /** 게시글 삭제 여부 (Y/N) */
    private String boardIsDeleted;

    /** 게시글 작성일 */
    private String boardCreateDate
    ;

    /** 게시글 수정일 */
    private String boardUpdateDate;

    /** 게시판 타입 번호 */
    private int boardTypeNo;

    /** 작성자 회원 번호 */
    private int memberNo;

    /** 첨부 이미지 리스트 */
    private List<BoardImage> boardImages = new ArrayList<>();

    /** 첨부 파일 리스트 */
    private List<BoardFile> boardFiles = new ArrayList<>();

    /** 게시글 작성자 프로필 이미지*/
    private String profileImg;

    /** 게시글의 썸네일 이미지 */
    private String thumbnail;

    /** 임시) 게시글 좋아요 여부 확인 */
    private int likeCheck;
    
    // 멤버 닉네임
    private String memberNickname;
    
    
	private int boardCommentCount; // 댓글 수
	private int boardLikeCount; // 좋아요 수
	private List<BoardComment> boardComments = new ArrayList<>();;
	private String boardTypeName;

	
	private int rank; // 메인화면 출력용 rank 필드
	private int isNew; // 메인화면 출력용 isNew 필드
	private int mainCp;
}

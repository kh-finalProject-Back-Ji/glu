	package edu.kh.eightgyosi.board.model.dto;
	
	import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
	
	/**
	 * 게시글 첨부파일 DTO
	 * - board_file 테이블과 매핑
	 */
	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public class BoardFile {
	
	    /** 파일 번호 (PK) */
	    private int uploadfileNo;
	
	    /** 원본 파일명 */
	    private String uploadfileOrigin;
	
	    /** 서버 저장 경로 */
	    private String uploadfilePath;
	
	    /** 서버 저장명 */
	    private String uploadfileStrg;
	
	    /** 파일 크기 */
	    private long uploadfileSize;
	
	    /** 업로드 날짜 */
	   // private LocalDateTime uploadfileDate;
	
	    /** 게시글 번호 (FK) */
	    private int boardId;
	    

	    /** null-safe 빈 리스트 반환 (Controller에서 사용) */
	    public static List<BoardFile> emptyList() {
	        return new ArrayList<>();
	    }
	    
	}

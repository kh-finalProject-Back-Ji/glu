package edu.kh.eightgyosi.board.model.service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.eightgyosi.board.model.dto.Board;
import edu.kh.eightgyosi.board.model.dto.BoardFile;
import edu.kh.eightgyosi.board.model.dto.BoardImage;
import edu.kh.eightgyosi.board.model.dto.BoardType;
import edu.kh.eightgyosi.board.model.mapper.EditBoardMapper;
import edu.kh.eightgyosi.common.config.FileConfig;
import edu.kh.eightgyosi.member.model.dto.Member;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EditBoardServiceImpl implements EditBoardService {

    private final EditBoardMapper mapper;
    private final FileConfig fileConfig;

    /** 게시글 작성 */
    @Override
    public int boardInsert(Board board, List<MultipartFile> images, List<MultipartFile> files) throws Exception {
        mapper.insertBoard(board);
        int boardId = board.getBoardId();

        if(images != null) saveBoardImages(boardId, images);
        if(files != null) saveBoardFiles(boardId, files);

        return boardId;
    }

    /** 게시글 수정 */
    @Override
    public int boardUpdate(Board board, List<MultipartFile> images, List<MultipartFile> files,
                           List<Integer> deleteImageList, List<Integer> deleteFileList) throws Exception {

        int result = mapper.updateBoard(board);
        if(result == 0) return 0;

        // 이미지 삭제
        if(deleteImageList != null) {
            for(int imgNo : deleteImageList){
                BoardImage img = mapper.selectBoardImageById(imgNo);
                if(img != null){
                    deletePhysicalFile(fileConfig.getBoardResourceLocation() + img.getImgRename());
                    mapper.deleteBoardImage(img.getImgNo());
                }
            }
        }

        if(images != null) saveBoardImages(board.getBoardId(), images);

        // 파일 삭제
        if(deleteFileList != null) {
            for(int fileNo : deleteFileList){
                BoardFile bf = mapper.selectBoardFile(fileNo);
                if(bf != null){
                    deletePhysicalFile(fileConfig.getBoardResourceLocation() + bf.getUploadfileStrg());
                    mapper.deleteBoardFile(bf.getUploadfileNo());
                }
            }
        }

        if(files != null) saveBoardFiles(board.getBoardId(), files);

        return result;
    }

    /** 게시글 삭제 */
    @Override
    public int boardDelete(int boardId, Member loginMember) throws Exception {
        Board board = mapper.selectBoardDetail(Map.of("boardId", boardId));
        if(board == null) return 0;

        if(board.getMemberNo() != loginMember.getMemberNo() && loginMember.getRole() != Member.Role.ADMIN) return 0;

        // 이미지 삭제
        List<BoardImage> images = mapper.selectBoardImages(boardId);
        for(BoardImage img : images){
            deletePhysicalFile(fileConfig.getBoardResourceLocation() + img.getImgRename());
            mapper.deleteBoardImage(img.getImgNo());
        }

        // 파일 삭제
        List<BoardFile> files = mapper.selectBoardFiles(boardId);
        for(BoardFile f : files){
            deletePhysicalFile(fileConfig.getBoardResourceLocation() + f.getUploadfileStrg());
            mapper.deleteBoardFile(f.getUploadfileNo());
        }

        return mapper.deleteBoard(Map.of("boardId", boardId, "memberNo", loginMember.getMemberNo()));
    }

    /** 단일 게시글 조회 */
    @Override
    public Board selectBoard(int boardId){
        return mapper.selectBoardDetail(Map.of("boardId", boardId));
    }

    /** 게시글 이미지 조회 */
    @Override
    public List<BoardImage> selectBoardImages(int boardId){
        return mapper.selectBoardImages(boardId);
    }

    /** 게시글 파일 목록 조회 */
    @Override
    public List<BoardFile> selectBoardFiles(int boardId){
        return mapper.selectBoardFiles(boardId);
    }

    /** 게시글 단일 파일 조회 */
    @Override
    public BoardFile selectBoardFile(int fileId){
        return mapper.selectBoardFile(fileId);
    }

    /** 파일 업로드 */
    @Override
    public String uploadFile(MultipartFile file) throws Exception {
        String folderPath = fileConfig.getBoardFolderPath();

        File dir = new File(folderPath);
        if (!dir.exists()) dir.mkdirs();

        String origin = file.getOriginalFilename();
        String ext = origin.substring(origin.lastIndexOf("."));
        String rename = UUID.randomUUID() + ext;

        file.transferTo(new File(folderPath + rename));
        
        return fileConfig.getBoardWebPath() + rename;
    }

    /** 관리자 전용 카테고리 확인 */
    @Override
    public boolean isAdminOnlyCategory(int boardTypeNo){
        return boardTypeNo == 6;
    }

    /** 게시판 카테고리 조회 */
    @Override
    public List<BoardType> getCategoryList(){
        return mapper.selectCategoryList();
    }

    /** ================== 내부 유틸 ================== */
    private void saveBoardImages(int boardId, List<MultipartFile> images) throws Exception {
        int order = mapper.selectMaxImgOrder(boardId) + 1;
        for(MultipartFile file : images){
            if(file.isEmpty()) continue;

            String origin = file.getOriginalFilename();
            String ext = origin.substring(origin.lastIndexOf("."));
            String rename = UUID.randomUUID() + ext;

            File dir = new File(fileConfig.getBoardResourceLocation());
            if(!dir.exists()) dir.mkdirs();
            file.transferTo(new File(fileConfig.getBoardFolderPath() + rename));

            BoardImage img = new BoardImage();
            img.setBoardId(boardId);
            img.setImgOrder(order++);
            img.setImgRename(rename);
            img.setImgPath("/images/board/" + rename);
            img.setImgOriginalName(origin);
            img.setImgSize(file.getSize());

            mapper.insertBoardImage(img);
        }
    }

    private void saveBoardFiles(int boardId, List<MultipartFile> files) {
        // 디렉토리 생성 (반복문 밖에서 한 번만)
        String folderPath = fileConfig.getBoardFolderPath();
        if (!folderPath.endsWith("/") && !folderPath.endsWith("\\")) {
            folderPath += "/";
        }
        File dir = new File(folderPath);
        if (!dir.exists()) dir.mkdirs();

        for (MultipartFile f : files) {
            if (f.isEmpty()) continue;

            try {
                String origin = f.getOriginalFilename();
                if (origin == null || origin.isBlank()) continue; // 안전 처리

                // 확장자 추출
                String ext = "";
                int dotIndex = origin.lastIndexOf(".");
                if (dotIndex != -1) {
                    ext = origin.substring(dotIndex);
                }

                // 랜덤 이름 생성
                String rename = UUID.randomUUID() + ext;

                // 실제 파일 저장
                File dest = new File(folderPath + rename);
                f.transferTo(dest);

                // DB 저장용 DTO 생성
                BoardFile bf = new BoardFile();
                bf.setBoardId(boardId);
                bf.setUploadfileOrigin(origin);
                bf.setUploadfileStrg(rename);
                bf.setUploadfileSize(f.getSize());
                bf.setUploadfilePath(fileConfig.getBoardWebPath() + rename);

                mapper.insertBoardFile(bf);

            } catch (Exception e) {
                e.printStackTrace(); // 실패 로깅, 다음 파일 계속 진행
            }
        }
    }




    private void deletePhysicalFile(String path){
        File file = new File(path);
        if(file.exists()) file.delete();
    }
}

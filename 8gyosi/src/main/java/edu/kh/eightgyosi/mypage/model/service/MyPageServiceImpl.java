package edu.kh.eightgyosi.mypage.model.service;

import java.io.File;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.eightgyosi.common.util.Utility;
import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.ProfileUploadFile;
import edu.kh.eightgyosi.mypage.model.mapper.MyPageMapper;

@Service
@Transactional(rollbackFor = Exception.class)
@PropertySource("classpath:config.properties")
public class MyPageServiceImpl implements MyPageService {

	@Autowired
	private MyPageMapper myPageMapper;

	@Autowired
	private BCryptPasswordEncoder bcrypt;
	
	@Value("${my.profile.web-path}")
	private String profileWebPath; // /myPage/profile/
	
	@Value("${my.profile.folder-path}")
	private String profileFolderPath; // C:/uploadFiles/profile/

	// 회원 정보 서비스
	@Override
	public int updateInfo(Member member, String[] memberAddress) {

		// 입력된 주소가 있을 경우
		// A^^^B^^^C 형태로 가공

		// 주소가 입력되었을 때
		if (!member.getMemberAddress().equals(",,")) {
			String address = String.join("^^^", memberAddress);
			member.setMemberAddress(address);

		} else {
			// 주소가 입력되지 않았을 때
			member.setMemberAddress(null);
		}

		return myPageMapper.updateInfo(member);
	}

	// 비밀번호 변경 서비스
	@Override
	public int changePw(Map<String, Object> paramMap, int memberNo) {

		// 현재 비밀번호가 일치하는지 확인하기
		String originPw = myPageMapper.selectPw(memberNo);

		// 입력받은 현재 비밀번호와(평문)
		// DB에서 조회한 비밀번호(암호화)를 비교
		if (!bcrypt.matches((String) paramMap.get("currentPw"), originPw)) {
			return 0;
		}

		// 새 비밀번호를 암호화
		String encPw = bcrypt.encode((String) paramMap.get("newPw"));

		// 진행후 DB에 업데이트
		paramMap.put("encPw", encPw);
		paramMap.put("memberNo", memberNo);

		return myPageMapper.changePw(paramMap);
	}

	/**
	 * 회원 탈퇴 서비스
	 *
	 */
	@Override
	public int secession(String memberPw, int memberNo) {

		// 현재 로그인한 회원의 암호화된 비밀번호를 DB에서 조회
		String encPw = myPageMapper.selectPw(memberNo);
		
		// 입력받은 비밀번호 & 암호화된 DB 비밀번호 같은지 비교
		if (!bcrypt.matches(memberPw, encPw)) {
			return 0;
		}
		
		// 같은 경우
		return myPageMapper.secession(memberNo);
	}

	@Override
	public String fileUpload1(MultipartFile uploadFile) throws Exception {
		
		
		if(uploadFile.isEmpty()) { // 업로드한 파일이 없을 경우
			return null;
		}
		
		// 업로드한 파일이 있을 경우
		// C:/uploadFiles/test/파일명으로 서버에 저장
		uploadFile.transferTo(new File("C:/uploadFiles/test/" 
		+ uploadFile.getOriginalFilename()));
		
		// C:/uploadFiles/test/하기와.jpg
		
		// 웹에서 해당 파일에 접근할 수 있는 경로를 만들어 반환
		
		// 이미지가 최종 저장된 서버 컴퓨터상의 경로
		// C:/uploadFiles/test/파일명.jpg
		
		// 클라이언트가 브라우저에 해당 이미지를 보기 위해 요청하는 경로
		// ex) <img src="경로">
		// /myPage/file/파일명.jpg -> <img src="/myPage/file/파일명.jpg">
		
		return "/myPage/file/" + uploadFile.getOriginalFilename();
	}
	
	// 파일 업로드 테스트 2 (서버 저장, DB 저장)
	@Override
	public int fileUpload2(MultipartFile uploadFile, int memberNo) throws Exception {
		
		// MultipartFile이 제공하는 메서드
		// - isEmpty() : 업로드된 파일이 없을 경우 true / 있다면 false
		// - getSize() : 파일 크기
		// - getOriginalFileName() : 원본 파일명
		// - transferTo(경로) :
		// 메모리 또는 임시 저장 경로에 업로드된 파일을
		// 원하는 경로에 실제로 전송(서버 어떤 폴더에 저장할지 지정)
		
		// 업로드된 파일이 없다면
		if(uploadFile.isEmpty()) {
			return 0;
		}
		
		// 업로드된 파일이 있다면
		
		// 1. 서버에 저장될 서버 폴더 경로 만들기
		
		// 파일이 저장될 서버 폴더 경로
		String folderPath = "C:/uploadFiles/test/";
		
		// 클라이언트가 파일이 저장된 폴더에 접근할 수 있는 주소(요청 주소)
		String webPath = "/myPage/file/";
		
		
		// 2. DB에 전달할 데이터를 DTO에 묶어서 INSERT
		// webPath, memberNo, 원본파일명, 변경된파일명
		String fileRename = Utility.fileRename(uploadFile.getOriginalFilename());
		
		// Builder 패턴을 이용해서 UploadFile 객체 생성
		// 장점 1) 반복되는 참조변수명, set 구문 생략
		// 장점 2) method chaining을 이용하여 한 줄로 작성 가능
		ProfileUploadFile uf = ProfileUploadFile.builder()
								.memberNo(memberNo)
								.filePath(webPath)
								.fileOriginalName(uploadFile.getOriginalFilename())
								.fileRename(fileRename)
								.build();
		
		int result = myPageMapper.insertUploadFile(uf);
		
		// 3. 삽입 (INSERT) 성공 시 파일을 지정된 서버 폴더에 저장
		// 삽입 실패 시
		if(result == 0) return 0;
		
		// 삽입 성공 시
		// C:/uploadFiles/test/변경된 파일명으로
		// 파일을 서버 컴퓨터에 저장!
		uploadFile.transferTo(new File(folderPath + fileRename));
		// C:/uploadFiles/test/20251211100330_00001.jpg
		
		
		return result; // 1
	}

	// 회원 프로필 이미지 변경 서비스
	@Override
	public int profile(MultipartFile profileImg, Member loginMember) throws Exception {
		
		// 프로필 이미지 경로 (수정할 경로)
		String updatePath = null;
		
		// 변경명 저장
		String rename = null;
		
		// 업로드한 이미지가 있을 경우
		if( !profileImg.isEmpty() ) {
			// updatePath 경로 조합
			
			// 1. 파일명 변경
			rename = Utility.fileRename(profileImg.getOriginalFilename());
			
			// 2. /myPage/profile/변경된 파일명
			updatePath = profileWebPath + rename;
		}
		
		// 수정된 프로필 이미지 경로 + 회원 번호를 저장할 DTO 객체
		Member member = Member.builder()
						.memberNo(loginMember.getMemberNo())
						.profileImg(updatePath)
						.build();
		
		// UPDATE 수행
		int result = myPageMapper.profile(member);
		
		if(result > 0) { // DB에 업데이트 성공
			
			// 프로필 이미지를 없앤 경우(NULL로 수정한 경우)를 제외
			// -> 업로드한 이미지가 있을 경우
			if( !profileImg.isEmpty() ) {
				// 파일을 서버 지정된 폴더에 저장
				profileImg.transferTo(new File(profileFolderPath + rename));
								// C:/uploadFiles/profile/변경한이름
			}
			
			// 세션에 등록된 현재 로그인한 회원 정보에서
			// 프로필 이미지 경로를 DB에 업데이트한 경로로 변경
			loginMember.setProfileImg(updatePath);
			
		}
		
		
		return result;
	}


}

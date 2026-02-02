package edu.kh.eightgyosi.mypage.model.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import edu.kh.eightgyosi.member.model.dto.Member;

public interface MyPageService {

	/** 회원 정보 수정 서비스
	 * @param member
	 * @param memberAddress
	 * @return
	 */
	int updateInfo(Member member, String[] memberAddress);
	
	/** 회원 비밀번호 변경 서비스
	 * @param paramMap
	 * @param memberNo
	 * @return
	 */
	int changePw(Map<String, Object> paramMap, int memberNo);

	/** 회원 탈퇴 서비스
	 * @param memberPw
	 * @param memberNo
	 * @return
	 */
	int secession(String memberPw, int memberNo);

	/** 파일 업로드 테스트 1
	 * @param uploadFile
	 * @return
	 */
	String fileUpload1(MultipartFile uploadFile) throws Exception;

	/** 파일 업로드 테스트 2
	 * @param uploadFile
	 * @param memberNo
	 * @return
	 */
	int fileUpload2(MultipartFile uploadFile, int memberNo) throws Exception;

	/** 프로필 이미지 변경 서비스
	 * @param profileImg
	 * @param loginMember
	 * @return
	 */
	int profile(MultipartFile profileImg, Member loginMember) throws Exception;



	

}

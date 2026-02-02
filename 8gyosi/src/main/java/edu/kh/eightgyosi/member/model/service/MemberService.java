package edu.kh.eightgyosi.member.model.service;

import edu.kh.eightgyosi.member.model.dto.Member;

public interface MemberService {
	
	/** 로그인 서비스
	 * 
	 * @param member
	 * @return loginMember
	 * 
	 */
	Member login(Member member) throws Exception;

	/** 이메일 중복검사 서비스
	 * 
	 * @param memberEmail
	 * @return
	 */
	int checkEmail(String memberEmail);

	/** 닉네임 중복 검사
	 * @param nickname
	 * @return
	 */
	int checkNickname(String nickname);


	/** 회원가입 서비스
	 * @param member
	 * @param memberAddress
	 * @return
	 */
	int signup(Member member, String[] memberAddress);

	/** 프로필 이미지 변경 서비스
	 * @param profileImg
	 * @return 
	 */
//	int profile(MultipartFile profileImg) throws Exception;

}

package edu.kh.eightgyosi.member.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.eightgyosi.member.model.dto.Member;

@Mapper
public interface MemberMapper {

	/** 로그인 SQL 실행
	 * @param memberEmail
	 * @return loginMember
	 */
	Member login(String memberEmail) throws Exception;

	/** 이메일 중복 검사 SQL 실행
	 * @param memberEmail
	 * @return count
	 */
	int checkEmail(String memberEmail);

	/** 닉네임 중복 검사
	 * @param nickname
	 * @return
	 */
	int checkNickname(String nickname);

	/** 회원가입 SQL 실행
	 * @param member
	 * @return
	 */
	int signup(Member member);
	
	
	
	

}

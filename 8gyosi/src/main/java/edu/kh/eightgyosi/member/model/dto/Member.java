package edu.kh.eightgyosi.member.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
	
	private int memberNo;		// 회원 번호
	private String memberEmail;	// 회원 이메일(회원 ID)
	private String memberPw;	// 회원 비밀번호
	private String memberNickname;	// 회원 별명(활동명)
	private String memberTel;		// 회원 전화번호
	private String memberSchool;	// 회원 학교
	private String memberBirth;		// 회원 생년월일
	private String memberAddress;	// 회원 주소
	private String profileImg;		// 프로필 이미지
	private String enrollDate;		// 회원 가입일
	private String memberDelFl;		// 회원 탈퇴 여부(Y, N)
	private int authority;			// 권한( 1: 일반 2: 관리자 )
	private String memberBg;		// 회원 테마
	private String quotestContent;
	private int quotesFontSize;
	private String quotesFontFamily;
	// 다솔
	 /** 관리자 여부 enum */
    public enum Role {
        USER,
        ADMIN
    }
    
    public Role getRole() {
		return this.authority == 2 ? Role.ADMIN : Role.USER;
	}
	
	
}

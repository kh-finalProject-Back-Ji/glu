package edu.kh.eightgyosi.member.model.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.eightgyosi.common.util.Utility;
import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.member.model.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {
	
	private final MemberMapper mapper;
	private final BCryptPasswordEncoder bcrypt;
	
	/** 로그인 서비스
	 * @author dasol
	 * 
	 * @param member
	 * @return loginMember
	 */
	@Override
	public Member login(Member member) throws Exception {
		
		// 데이터 가공 ( 암호화 )
		String bcryptPassword = bcrypt.encode(member.getMemberPw());
		log.debug("bcryptPassword : " + bcryptPassword);
		
		// 1. 이메일이 일치하면서 탈퇴하지 않은 회원의 ( + 비밀번호 ) 조회
		Member loginMember = mapper.login(member.getMemberEmail());
		
		// 2. 만약에 일치하는 이메일이 없어서 조회 결과가 null 인 경우
		if(loginMember == null) return null;
		
		// 3. 입력받은 비밀번호(평문 : member.getMemberPw()) 와
		// 	  암호화된 비밀번호(loginMember.getMemberPw())
		//	  두 비밀번호가 일치하는지 확인
		
		// bcrypt.matches(평문, 암호화) : 평문과 암호화가 내부적으로
		//					일치한다고 판단이 되면 true , 아니면 false
		if(!bcrypt.matches(member.getMemberPw(), 
						loginMember.getMemberPw())) return null;
		
		// 로그인한 회원 정보에서 비밀번호 제거
		loginMember.setMemberPw(null);
		
		return loginMember;
	}

	// 이메일 중복 검사 서비스
	@Override
	public int checkEmail(String memberEmail) {
		return mapper.checkEmail(memberEmail);
	}
	
	// 닉네임 중복 검사 서비스
	@Override
	public int checkNickname(String nickname) {
		return mapper.checkNickname(nickname);
	}

	@Override
	public int signup(Member member, String[] memberAddress) {
		
		// 1. 주소 배열 -> 하나의 문자열로 가공
		// 주소가 입력되지 않으면
		// member.getMemberAddress() -> ",,"
		// memberAddress -> [,,]
		
		// 주소가 입력된 경우
		if(!member.getMemberAddress().equals(",,")) {
			// String.join("구분자", 배열)
			// -> 배열의 모든 요소 사이에 "구분자"를 추가하여
			//	  하나의 문자열로 만들어 반환하는 메서드
			
			String address = String.join("^^^", memberAddress);
			// "12345^^^서울시중구^^^3층,302호"
			
			// member의 주소값을 위에서 만든 주소로 세팅
			member.setMemberAddress(address);
			
		} else {
			// 주소가 입력되지 않은 경우
			member.setMemberAddress(null); // null 저장
			
		}
		
		// 주소가 입력되지 않은 경우
		
		
		// 2. 비밀번호 암호화
		// member 안의 memberPw -> 평문
		// 비밀번호를 암호화하여 member 에 세팅
		String encPw = bcrypt.encode(member.getMemberPw());
		member.setMemberPw(encPw);
		
		// 회원가입 메퍼 메서드 호출
		return mapper.signup(member);
	}

	
	
	// 프로필 이미지 변경 서비스
//	@Override
//	public int profile(MultipartFile profileImg) throws Exception {
//		
//		// 프로필 이미지 경로 (수정할 경로)
//		String updatePath = null;
//		
//		// 변경명 저장
//		String rename = null;
//		
//		// 업로드한 이미지가 있을 경우
//		if( !profileImg.isEmpty()) {
//			// updatePath 경로 조합
//			
//			// 1. 파일명 변경
//			rename = Utility.fileRename(profileImg.getOriginalFilename());
//			
//			// 2. /myPage/profile/변경된 파일명
//			
//		}
//		
//		return 0;
//	}
	
	
}

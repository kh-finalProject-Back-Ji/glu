package edu.kh.eightgyosi.member.controller;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.member.model.service.MemberService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@SessionAttributes({ "loginMember" })
@Controller
@RequestMapping("8gyosi")
@RequiredArgsConstructor
@Slf4j
public class MemberController {
	
	private final MemberService service;
	
	/** 로그인
	 * @author dasol
	 * @param member
	 */
	@PostMapping("login")
	public String login(Member member, 
						RedirectAttributes ra,
						Model model,
						@RequestParam(value="saveId", required = false) String saveId,
						HttpServletResponse resp) {
			
		try {
			Member loginMember = service.login(member);
			
			log.debug("loginMember : " + loginMember);
			
			// 로그인 실패 시
			if(loginMember == null) {
				ra.addFlashAttribute("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
				
			// 로그인 성공 시
			} else {
				// 1단계 request scope 에 세팅 
				// 2단계 작성한 @SessionAttributes() 어노테이션 session scope 이동 
				model.addAttribute("loginMember", loginMember);
				
								   /* **Cookie** */
				// 쿠키 객체 생성					 // 회원의 이메일
				Cookie cookie = new Cookie("saveId", loginMember.getMemberEmail());
				
				// 쿠키가 적용될 경로 설정
				cookie.setPath("/"); // 메인페이지 + 하위 주소 모두
				
				// 쿠키의 만료 기간 지정
				if(saveId != null) {
					cookie.setMaxAge(60 * 60 * 24 * 30); // 30일로 지정
					
				} else { // 미 체크 시
					cookie.setMaxAge(0); // 쿠키 삭제
				}
				
				// 클라이언트에 전달
				resp.addCookie(cookie);
				
			}
			
			
		} catch (Exception e) {
			
			log.info("로그인 중 예외 발생");
			e.printStackTrace();
		}
		
		return "redirect:/";
	
	}
	
	/** 로그아웃
	 * @param SessionStatus : @SessionAttributes로 지정된 특정 속성을
	 * 						 세션에서 제거할 수 있는 기능을 제공하는 객체
	 */
	@GetMapping("logout")
	public String logout(SessionStatus status) {
		
		// 세션에 저장된 로그인된 회원 정보를 지우기
		status.setComplete(); // 세션을 완료 ( 세션에 저장된 정보를 초기화 )
		
		return "redirect:/";
	}
	
	/** 회원가입 페이지로 이동
	 * 
	 */
	@GetMapping("signup")
	public String signupPage() {
		return "member/signup";
	}
	
	/** 이메일 중복 검사
	 * @return
	 */
	@ResponseBody
	@GetMapping("checkEmail")
	public int checkEmail(@RequestParam("memberEmail") String memberEmail) {
		return service.checkEmail(memberEmail);
	}
	
	/** 닉네임 중복 검사
	 * @param nickname
	 * @return
	 */
	@ResponseBody
	@GetMapping("checkNickname")
	public int checkNickname(@RequestParam("memberNickname") String nickname) {
		return service.checkNickname(nickname);
	}
	
	/** 회원가입
	 * @author dasol
	 * @param member
	 * @param memberAddress : 입력한 주소 input 3개의 값을 배열로 전달
	 * 						[ 우편번호, 도로명/지번주소, 상세주소]
	 * @param ra : RedirectAttributes 로 리다이렉트 시 1회성으로 
	 * 			   req -> session -> req로 전달되는 객체
	 * @return
	 */
	@PostMapping("signup")
	public String signup(@ModelAttribute Member member,
						@RequestParam("memberAddress") String[] memberAddress,
						RedirectAttributes ra
						) {
		
		// 회원가입 서비스 호출
		int result = service.signup(member, memberAddress);
		
		String path = null;
		String message = null;
		
		// 회원가입 성공 여부 조건
		if(result > 0) {
			message = member.getMemberNickname() 
					+ "님의 가입을 환영합니다!";
			
			path = "/";
			
		} else {
			message = "회원 가입 실패";
			path = "signup";
			
		}
		
		ra.addFlashAttribute("message", message);
		
		// redirect 는 Get 방식
		return "redirect:" + path;
	}

	
	
	
		
//	/** 프로필 이미지
//   * @author : dasol ( 보류 )
//	 * @param profileImg
//	 * @param ra
//	 * @return
//	 * @throws Exception
//	 */
//	@PostMapping("profile")
//	public String profile(@RequestParam("profileImg") MultipartFile profileImg,
//							RedirectAttributes ra) throws Exception {
//						
//		// 서비스 호출
//		int result = service.profile(profileImg);
//		
//		return ""; // 리다이렉트 - /myPage/profile GET 요청
//		
//	}

}
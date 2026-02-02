package edu.kh.eightgyosi.email.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import edu.kh.eightgyosi.email.model.service.EmailService;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("email")
@RequiredArgsConstructor
public class EmailController {
	
	@Autowired
	private final EmailService service;
	
	/** 이메일 인증 받기
	 * @author dasol
	 * @param email
	 * @return
	 */
	@ResponseBody
	@PostMapping("signup")
	public int signup(@RequestBody String email) {
		
		String authKey = service.sendEmail("signup", email);
		
		if(authKey != null) { // 인증번호가 반환되어 돌아옴
							  // == 이메일 보내기 성공
			return 1;
		}
		// 이메일 보내기 실패
		return 0;
		
	}
	
	/** 입력받은 이메일, 인증번호가 DB에 있는지 조회
	 * @param map : email, authKey
	 * @return
	 */
	@ResponseBody
	@PostMapping("checkAuthKey")
	public int checkAuthKey(@RequestBody Map<String, String> map) {
		return service.checkAuthKey(map);
	}
	
}

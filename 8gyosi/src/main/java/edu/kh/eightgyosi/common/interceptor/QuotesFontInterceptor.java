package edu.kh.eightgyosi.common.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.FontDTO;
import edu.kh.eightgyosi.mypage.model.service.DiaryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class QuotesFontInterceptor implements HandlerInterceptor {

	@Autowired
	private DiaryService service;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		// 1. 세션에서 로그인 유저 확인
		HttpSession session = request.getSession();
		Member loginMember = (Member) session.getAttribute("loginMember");

		if (loginMember != null) {
			// 2. DB에서 데이터 조회
			FontDTO quotes = service.selectquotesFont(loginMember.getMemberNo());

			// 3. ModelAndView 대신 HttpServletRequest에 데이터 직접 저장
			// 이렇게 담으면 Thymeleaf에서 ${quotes}로 바로 접근 가능합니다.
			request.setAttribute("quotes", quotes);

			log.info("인터셉터: request scope에 글귀 저장 완료");
		}

		return true; // 다음 단계(컨트롤러)로 진행
	}

	
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		// TODO Auto-generated method stub
		HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
	}

	
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
	}
}
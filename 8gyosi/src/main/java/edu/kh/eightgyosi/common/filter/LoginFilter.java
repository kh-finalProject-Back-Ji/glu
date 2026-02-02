package edu.kh.eightgyosi.common.filter;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// 로그인이 되어있지 않은 경우 특정 페이지 접근 불가하도록 필터링함
public class LoginFilter implements Filter{
	
	@Override
	public void doFilter(ServletRequest request, 
						 ServletResponse response, 
						 // FilterChain : 다음 필터 또는 
						 // DispatcherServlet과 연결된 객체
						 FilterChain chain)
			throws IOException, ServletException {
		
		HttpServletRequest req = (HttpServletRequest)request;
		HttpServletResponse resp = (HttpServletResponse)response;
		
		
		// 현재 들어온 요청 URI 가져온다
		String path = req.getRequestURI();
		
		// myPage/profile/ 요청은 통과 : dasol
		if(path.startsWith("/myPage/profile/")) {
			
			// 필터를 통과하도록 함
			chain.doFilter(request, response); 
			// 필터를 통과한 후 return
			return;	
		}
		
		// session 객체 얻어오기
		HttpSession session = req.getSession();
		
		if(session.getAttribute("loginMember") == null ) {
			
			// MainController 에서 loginError 매핑 : dasol
			resp.sendRedirect("/loginError"); // 로그인 되어 있지 않을 시 처리 경로 필요
			
		} else {
			
			// 다음 필터로 또는 다음 필터 없다면 
			// DispatcherServlet 으로 요청, 응답 전달			
			chain.doFilter(request, response);
		}
		
	}

}

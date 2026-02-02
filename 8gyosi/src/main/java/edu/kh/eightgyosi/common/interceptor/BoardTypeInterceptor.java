package edu.kh.eightgyosi.common.interceptor;

import java.util.List;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

import edu.kh.eightgyosi.board.model.dto.BoardType;
import edu.kh.eightgyosi.board.model.service.EditBoardService;
import edu.kh.eightgyosi.member.model.dto.Member;

@Slf4j
public class BoardTypeInterceptor implements HandlerInterceptor {

    private final EditBoardService service;

    public BoardTypeInterceptor(EditBoardService service) {
        this.service = service;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        ServletContext application = request.getServletContext();

        // 게시판 리스트 캐싱
        if (application.getAttribute("boardTypeList") == null) {
            List<BoardType> boardTypeList = service.getCategoryList();
            application.setAttribute("boardTypeList", boardTypeList);
        }

        // 관리자 전용 접근 체크 (write/update/delete만)
        Object loginObj = request.getSession().getAttribute("loginMember");
        if (loginObj instanceof Member member) {
            String uri = request.getRequestURI(); // 예: /editBoard/6/insert
            try {
                String[] parts = uri.split("/");
                if (parts.length > 3) {
                    int boardTypeNo = Integer.parseInt(parts[2]);
                    String action = parts[3]; // insert, update, delete

                    if (service.isAdminOnlyCategory(boardTypeNo)
                            && member.getRole() != Member.Role.ADMIN
                            && (action.equals("insert") || action.equals("update") || action.equals("delete"))) {
                        response.sendRedirect(request.getContextPath() + "/editBoard/" + boardTypeNo);
                        return false;
                    }
                }
            } catch (NumberFormatException e) {
                log.warn("URI에서 boardTypeNo 파싱 실패: {}", uri);
            }
        }

        return true;
    }
}

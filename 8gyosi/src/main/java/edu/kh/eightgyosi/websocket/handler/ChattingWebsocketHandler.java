
package edu.kh.eightgyosi.websocket.handler;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.kh.eightgyosi.chatting.model.dto.Message;
import edu.kh.eightgyosi.chatting.model.service.ChattingService;
import edu.kh.eightgyosi.member.model.dto.Member;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component // bean 으로 등록
@Slf4j
@RequiredArgsConstructor
public class ChattingWebsocketHandler extends TextWebSocketHandler{

	private final ChattingService service;
	
	private Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
	
	// 클라이언트와 연결이 완료되고, 통신할 준비가 되면 실행하는 메서드
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		sessions.add(session);
		log.info("{} 연결됨", session.getId());
	}		
	
	// 클라이언트와 연결이 종료되면 실행하는 메서드
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		sessions.remove(session);
		log.info("{} 연결 끊김", session.getId());
	}
	
	
	// 클라이언트로부터 텍스트가 담긴 메시지를 받았을 때 실행하는 메서드
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		
		// message - JS에서 클라이언트로 전달받은 내용
		// ex) {"senderNo" : "1", "targetNo" : "2", "chattingRoomNo": "8", "messageContent" : "하이!"}
		
		// Jackson 에서 제공하는 객체
		ObjectMapper objectMapper = new ObjectMapper();
		
		Message msg = objectMapper.readValue(message.getPayload(), Message.class);
		
		log.info("msg : {}", msg);
		
		// DB 삽입 서비스 호출
		int result = service.insertMessage(msg);
		
		if(result > 0) {
			
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy.mm.dd hh:mm");
			msg.setSendTime(sdf.format(new Date()));
			
			// 필드에 있는 sessions에는 
			// 채팅 페이지에 접속한 로그인한 모든 회원의 세션이 있음
			// -> 이 sessions 에서 현재 로그인한 회원, 대상을 구해야함
			for(WebSocketSession s : sessions) {
				
				// 회원의 세션객체에서 해당 회원의 memberNo 꺼내와야함
				// 1. 가로챈 session 꺼내기
				HttpSession temp = (HttpSession)s.getAttributes().get("session");
				
				// 2. session에서 loginMember로 등록된 Member 객체의 memberNo 꺼내오기
				int loginMemberNo = ((Member)temp.getAttribute("loginMember")).getMemberNo();
				
				// 3. loginMemberNo값이 targetNo 또는 senderNo와 일치하는 회원만 선택
				if(loginMemberNo == msg.getTargetNo() || loginMemberNo == msg.getSenderNo()) {
					
					// 메세지 전달(서버쪽에서 해당되는 클라이언트에게 해당 메시지를 전송)
					// JAVA(Message DTO) -> JS (JSON 변환 : JS에 보내야하니깐
					// (Controller가 아니라 우리가 직접 변환 해줘야한다.))  
					String jsonData = objectMapper.writeValueAsString(msg);
					s.sendMessage(new TextMessage(jsonData));
					
				}
			}
			
			
			
			
		}
		
		
	}
	
	
	
}

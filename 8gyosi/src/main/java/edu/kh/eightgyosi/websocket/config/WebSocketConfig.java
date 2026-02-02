package edu.kh.eightgyosi.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import edu.kh.eightgyosi.websocket.handler.ChattingWebsocketHandler;
import lombok.RequiredArgsConstructor;

@Configuration		// 서버 실행 시 작성된 메서드를 모두 수행
@EnableWebSocket 	// 웹소켓 활성화 설정
@RequiredArgsConstructor 
public class WebSocketConfig implements WebSocketConfigurer{

	// WebSocketConfigurer : 
	// Spring 에서 웹소켓 통신을 어디에서, 어떤방식으로 할 것인지 
	// 규칙을 정의하는 설정용 인터페이스
	// 1. 핸들러 등록
	// 2. 접속 주소 매핑
	// 3. 부가 기능 설정 
	
	
	private final ChattingWebsocketHandler chattingWebsocketHandler;
	
	// Bean으로 등록된 SessionHandshakeInterceptor 주입됨
	private final HandshakeInterceptor handshakeInterceptor;
	
	// 웹소켓 핸들러를 등록하는 메서드
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		// addHandler(웹소켓핸들러, "웹소켓 요청 주소")
		

		// ------------------------------------------
		
		registry
		.addHandler(chattingWebsocketHandler, "/chattingSock")
		.addInterceptors(handshakeInterceptor)
		.setAllowedOriginPatterns("http://localhost/", 
								  "http://127.0.0.1/", 
								  "http://192.168.32.11/")
		.withSockJS();
		
		
		
		
	}

	
	
	
}

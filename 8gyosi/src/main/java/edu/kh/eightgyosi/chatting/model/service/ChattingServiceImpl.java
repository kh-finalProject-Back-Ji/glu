package edu.kh.eightgyosi.chatting.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.chatting.model.dto.ChattingRoom;
import edu.kh.eightgyosi.chatting.model.dto.Message;
import edu.kh.eightgyosi.chatting.model.mapper.ChattingMapper;
import edu.kh.eightgyosi.member.model.dto.Member;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class ChattingServiceImpl implements ChattingService{
	
	@Autowired
	private ChattingMapper mapper;	
	
	// 채팅방 목록 조회
	@Override
	public List<ChattingRoom> selectRoomList(int memberNo) {
		return mapper.selectRoomList(memberNo);
	}
	
	// 채팅 상대 검색 서비스
	@Override
	public List<Member> selectTarget(Map<String, Object> map) {
		return mapper.selectTarget(map);
	}
	
	// 채팅방번호 체크 서비스
	@Override
	public int checkChattingRoomNo(Map<String, Integer> map) {
		return mapper.checkChattingRoomNo(map);
	}
	
	// 새로운 채팅방 생성 서비스
	@Override
	public int createChattingRoom(Map<String, Integer> map) {
		
		int result = mapper.createChattingRoom(map);
		
		if(result > 0) {
			return map.get("chattingRoomNo");
		}
		
		return 0;
	}
	
	// 채팅 메시지 조회 서비스
	@Override
	public List<Message> selectMessageList(Map<String, Object> paramMap) {
		
		List<Message> messageList = mapper.selectMessageList(paramMap.get("chattingRoomNo"));
		
		if(!messageList.isEmpty()) { // 해당 채팅방에서 나눈 메시지가 있다면
			int result = mapper.updateReadFlag(paramMap);
		}
		
		return messageList;
	}
	
	// 읽음 표시 업데이트 서비스
	@Override
	public int updateReadFlag(Map<String, Object> paramMap) {
		return mapper.updateReadFlag(paramMap);
	}
	
	// 채팅 입력 서비스
	@Override
	public int insertMessage(Message msg) {
		return mapper.insertMessage(msg);
	}
	
	
}
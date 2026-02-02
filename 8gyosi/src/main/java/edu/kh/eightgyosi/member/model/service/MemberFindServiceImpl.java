package edu.kh.eightgyosi.member.model.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.eightgyosi.member.model.mapper.MemberFindMapper;
import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class MemberFindServiceImpl implements MemberFindService {
	
	private final MemberFindMapper mapper;
	
	

}

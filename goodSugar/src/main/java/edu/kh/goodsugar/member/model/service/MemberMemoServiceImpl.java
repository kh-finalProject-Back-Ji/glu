package edu.kh.goodsugar.member.model.service;

import org.springframework.stereotype.Service;

import edu.kh.goodsugar.member.model.dto.MemberMemo;
import edu.kh.goodsugar.member.model.mapper.MemberMemoMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberMemoServiceImpl implements MemberMemoService {

    private final MemberMemoMapper mapper;

    @Override
    public MemberMemo getMemo(Long memberId) {
        return mapper.selectMemberMemo(memberId);
    }

    @Override
    public void saveMemo(Long memberId, String memo) {
        mapper.upsertMemberMemo(memberId, memo);
    }
}

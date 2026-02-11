package edu.kh.goodsugar.member.model.service;

import edu.kh.goodsugar.member.model.dto.MemberMemo;

public interface MemberMemoService {
    MemberMemo getMemo(Long memberId);
    void saveMemo(Long memberId, String memo);
}

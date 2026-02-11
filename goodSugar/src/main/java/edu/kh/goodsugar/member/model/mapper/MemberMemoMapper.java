package edu.kh.goodsugar.member.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.goodsugar.member.model.dto.MemberMemo;

@Mapper
public interface MemberMemoMapper {

    MemberMemo selectMemberMemo(@Param("memberId") Long memberId);

    int upsertMemberMemo(@Param("memberId") Long memberId,
                         @Param("memo") String memo);
}

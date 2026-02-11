package edu.kh.goodsugar.member.model.mapper;

import edu.kh.goodsugar.member.model.dto.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {

    Member selectByEmail(@Param("email") String email);

    int insertMember(Member member);

    Member selectByOAuth(@Param("oauthProvider") String oauthProvider,
                         @Param("oauthUid") String oauthUid);

    int insertOAuthMember(Member member);

    int updateLastLogin(@Param("memberId") Long memberId);

    int existsNickname(@Param("nickname") String nickname);
    int existsEmail(@Param("email") String email);

    // ✅ 내정보
    Member selectMe(@Param("memberId") Long memberId);
    int updateMe(Member member);

    // ✅ 프로필 이미지 업데이트
    int updateProfileImg(@Param("memberId") Long memberId,
                         @Param("profileImg") String profileImg);
    
    int updatePasswordHash(@Param("memberId") Long memberId,
            @Param("passwordHash") String passwordHash);

}

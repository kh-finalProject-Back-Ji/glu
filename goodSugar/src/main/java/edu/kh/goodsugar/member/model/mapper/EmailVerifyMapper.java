package edu.kh.goodsugar.member.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailVerifyMapper {

    int upsertCode(@Param("email") String email,
                   @Param("code") String code,
                   @Param("expiredAtMinutes") int expiredAtMinutes);

    int verify(@Param("email") String email,
               @Param("code") String code);

    int isVerifiedValid(@Param("email") String email);
}
package edu.kh.goodsugar.health.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import edu.kh.goodsugar.health.model.dto.DiabetesProfile;

@Mapper
public interface DiabetesProfileMapper {

    DiabetesProfile selectByMemberId(Long memberId);

    int upsert(DiabetesProfile profile);

}

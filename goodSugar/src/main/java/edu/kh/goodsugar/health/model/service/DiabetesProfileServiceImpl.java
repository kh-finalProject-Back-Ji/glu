package edu.kh.goodsugar.health.model.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.goodsugar.health.model.dto.DiabetesProfile;
import edu.kh.goodsugar.health.model.mapper.DiabetesProfileMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DiabetesProfileServiceImpl implements DiabetesProfileService {

    private final DiabetesProfileMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DiabetesProfile getProfile(Long memberId) {
        return mapper.selectByMemberId(memberId);
    }

    @Override
    public int upsert(DiabetesProfile profile) {
        // hasComplication / familyHistoryYn null 들어오면 DB 체크에서 터질 수 있으니 기본값 보정
        if (profile.getHasComplication() == null || profile.getHasComplication().isBlank()) {
            profile.setHasComplication("N");
        }
        if (profile.getFamilyHistoryYn() == null || profile.getFamilyHistoryYn().isBlank()) {
            profile.setFamilyHistoryYn("N");
        }
        return mapper.upsert(profile);
    }
}

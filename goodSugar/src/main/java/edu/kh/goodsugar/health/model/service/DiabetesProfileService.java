package edu.kh.goodsugar.health.model.service;

import edu.kh.goodsugar.health.model.dto.DiabetesProfile;

public interface DiabetesProfileService {
    DiabetesProfile getProfile(Long memberId);
    int upsert(DiabetesProfile profile);
}

package edu.kh.goodsugar.member.controller;

import java.io.File;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.goodsugar.member.model.dto.Member;
import edu.kh.goodsugar.member.model.service.MemberService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberMeController {

    private final MemberService service;

    @Value("${my.profile.folder-path}")
    private String folderPath;

    @Value("${my.profile.web-path}")
    private String webPath;

    @GetMapping("/me")
    public Member me(Authentication authentication) {
        Long memberId = Long.parseLong(authentication.getName());
        return service.getMe(memberId);
    }

    @PutMapping("/me")
    public Member updateMe(Authentication authentication, @RequestBody Member req) {
        Long memberId = Long.parseLong(authentication.getName());
        return service.updateMe(memberId, req);
    }

    // ✅ 프로필 이미지 업로드 (404 해결: 이 경로가 정확히 있어야 함)
    @PostMapping(value = "/me/profile-image", consumes = "multipart/form-data")
    public Map<String, Object> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        Long memberId = Long.parseLong(authentication.getName());

        if (file == null || file.isEmpty()) {
            return Map.of("ok", false, "message", "NO_FILE");
        }

        String original = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(original);
        ext = (ext == null) ? "" : ext.toLowerCase();

        if (!(ext.equals("png") || ext.equals("jpg") || ext.equals("jpeg") || ext.equals("webp"))) {
            return Map.of("ok", false, "message", "BAD_EXT");
        }

        // 저장 폴더 생성
        File dir = new File(folderPath);
        if (!dir.exists()) dir.mkdirs();

        // 파일명 난수화
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        File save = new File(dir, filename);

        file.transferTo(save);

        // DB에는 path만 저장 (추천)
        String dbValue = webPath + filename; // 예: /myPage/profile/xxx.png

        Member updated = service.updateProfileImg(memberId, dbValue);
        return Map.of("ok", true, "profileImg", updated.getProfileImg());
    }
}

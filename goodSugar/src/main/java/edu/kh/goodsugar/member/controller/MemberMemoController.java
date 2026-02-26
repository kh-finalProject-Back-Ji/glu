package edu.kh.goodsugar.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.kh.goodsugar.member.model.dto.MemberMemo;
import edu.kh.goodsugar.member.model.service.MemberMemoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/member/memo")
@RequiredArgsConstructor
public class MemberMemoController {

    private final MemberMemoService service;

    @GetMapping
    public ResponseEntity<MemberMemo> getMemo(@RequestParam("memberId") Long memberId) {
        MemberMemo memo = service.getMemo(memberId);
        if (memo == null) {
            memo = new MemberMemo(memberId, "", null, null);
        }
        return ResponseEntity.ok(memo);
    }

    @PutMapping
    public ResponseEntity<String> saveMemo(@RequestBody MemberMemo body) {
        if (body == null || body.getMemberId() == null) {
            return ResponseEntity.badRequest().body("memberId required");
        }
        service.saveMemo(body.getMemberId(), body.getMemo());
        return ResponseEntity.ok("saved");
    }
}

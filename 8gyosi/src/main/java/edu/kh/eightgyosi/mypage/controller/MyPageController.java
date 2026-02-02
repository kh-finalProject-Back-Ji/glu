package edu.kh.eightgyosi.mypage.controller;


import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.eightgyosi.board.controller.BoardController;
import edu.kh.eightgyosi.member.model.dto.Member;
import edu.kh.eightgyosi.mypage.model.dto.CalenderDTO;
import edu.kh.eightgyosi.mypage.model.dto.DiaryDTO;
import edu.kh.eightgyosi.mypage.model.dto.FontDTO;
import edu.kh.eightgyosi.mypage.model.dto.TimetableDTO;
import edu.kh.eightgyosi.mypage.model.dto.WrongNoteDTO;
import edu.kh.eightgyosi.mypage.model.service.CalenderService;
import edu.kh.eightgyosi.mypage.model.service.DiaryService;
import edu.kh.eightgyosi.mypage.model.service.MyPageService;
import edu.kh.eightgyosi.mypage.model.service.TimetableService;
import edu.kh.eightgyosi.mypage.model.service.WrongNoteService;
import lombok.extern.slf4j.Slf4j;

/**
 * 
 */
@SessionAttributes({ "calender", "loginMember" })
@Controller
@RequestMapping("myPage")
@Slf4j
public class MyPageController {

    private final BoardController boardController;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	private CalenderService calService; // 캘린더 서비스 필드 선언

	@Autowired
	private WrongNoteService wroService; // 오답노트 서비스 필드 선언

	@Autowired
	private DiaryService diaryService; // 다이어리 서비스 필드 선언

	@Autowired
	private MyPageService myPageService; // 내 정보 변경

	
	@Autowired
	private TimetableService timetableService;

    MyPageController(BCryptPasswordEncoder bCryptPasswordEncoder, BoardController boardController) {
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.boardController = boardController;
    }
	

	
	/**
	 * @param loginMember : 로그인된 멤버의 멤버 객체(session 에 담김)
	 * @param semester : selectTimetable() 메서드를 통해 생성된 데이터
	 * @return
	 */
	@GetMapping("")
	public String mainPage(@SessionAttribute("loginMember") Member loginMember, Model model) {

		// 1. 회원의 캘린더 정보 뿌려주기
		
		int memberNo = loginMember.getMemberNo();

		// 회원의 캘린더 정보 list로 얻어오기
		List<CalenderDTO> calender = calService.selectCalender(memberNo);

		// Model 객체 통해 조회된 결과 담고, 클래스 상단 @SessionAttributes 통해 Session 에 담기
		model.addAttribute("calender", calender);

		// test: log.debug("boardTypeList : " + application.getAttribute("boardTypeList"));
		// test: log.debug("결과 : " + calender);

		// 2. 오답노트 정보 뿌려주기
		List<WrongNoteDTO> wrongNoteDTOLists = wroService.selectWrongNote(memberNo);
		model.addAttribute("wrongNoteDTOLists", wrongNoteDTOLists);
		
		// 3. 시간표 정보 뿌려주기
		List<TimetableDTO> timetableDTOLists = timetableService.selectTimetable(memberNo);
		
		// 3-1. 만약 조회된 데이터가 없어서 1객체에 semester 하나만 든 값이 전달되었다면 
		// == 0번째 인덱스 중 semester 제외한 아무 값을 조회해 비었을 시
		boolean isTimetableEmpty = false;
		
		if(timetableDTOLists.get(0).getDayClassSubject() == null) {
			
			// 이중 배열 생성(해당 이중 배열이 timetable 채워줄 예정)
			// row : day
			// col : cls
			
			String[][] timetableDoubleArray = new String[6][7]; 
			for(int i = 0; i < 6; i++) {
				Arrays.fill(timetableDoubleArray[i], "미설정"); // 모든 행(i, day, 요일) 에 미설정 채워넣기 
			}
			
			// model 에 담아 전달
			model.addAttribute("fullTimetable", timetableDoubleArray);
			model.addAttribute("isTimetableEmpty", isTimetableEmpty);
			// 사실 isTimetableEmpty 값이 false 일 경우 타임리프에서 모두 미설정으로 처리되긴 한다.
			
			// 조회된 데이터가 없더라도 semester 정보는 있기에 전달한다.
			String semesterStr = timetableDTOLists.get(0).getSemester();
			model.addAttribute("semesterStr", semesterStr);
		
		} else { // 3-2. 조회된 결과 있다면
			String[][] timetableDoubleArray = new String[6][7];
			for(int i = 0; i < 6; i++) {
				Arrays.fill(timetableDoubleArray[i], "미설정"); // 모든 행(i, day, 요일) 에 미설정 채워넣기 
			}
			
			for(TimetableDTO temp : timetableDTOLists) { // 가져온 DTO 객체 하나씩 돌면서 과목이 있을 때만 "미설정" 대신 해당 과목 채워넣기
				int row = temp.getDay() - 1; // 인덱스로 반환 (0~5)
				int col = temp.getCls() - 1; // 인덱스로 반환 (0~6)
				
				if(row >= 0 && row < 6 && col >= 0 && col < 7) {
					timetableDoubleArray[row][col] = temp.getSubject(); // 이중 배열 특정 칸에 가져온 과목 넣기
				}
			}
			
			// model 에 담아 전달
			model.addAttribute("fullTimetable", timetableDoubleArray);
			model.addAttribute("isTimetableEmpty", isTimetableEmpty);
			log.debug(timetableDTOLists.toString());
			// 학기(2025-2) 정보 저장하여 담기
			// 조회된 데이터가 있다면 학기 정보는 모두 동일하므로 아무 인덱스의 정보를 보내주어도 무방
			String semesterStr = timetableDTOLists.get(0).getSemester();
			model.addAttribute("semesterStr", semesterStr);
		}
		
		return "myPage/myPage-main"; // forward	
	}

	/**
	 * 오답노트 조회하여 오답노트 페이지로 이동하는 get 방식 요청 처리 메서드
	 * 
	 * @param loginMember
	 * @param model
	 * @return
	 */
	@GetMapping("myPage-wrongNote/{wrongNoteNo:[0-9]+}")
	public String wrongNote(@SessionAttribute("loginMember") Member loginMember, Model model,
			@PathVariable("wrongNoteNo") int wrongNoteNo) {

		// 1. 오답노트 테이블 조회하기 위해 service 불러오기
		int memberNo = loginMember.getMemberNo();
		List<WrongNoteDTO> wrongNoteDTOLists = wroService.selectWrongNote(memberNo);
		model.addAttribute("wrongNoteDTOLists", wrongNoteDTOLists);

		// 2. 주소창에서 얻어온 wrongNoteNo 도 따로 model 로 전달
		model.addAttribute("wrongNoteNo", wrongNoteNo);

		// test: log.debug(wrongNote.get(0).getWrongNoteExplain());

		return "myPage/myPage-wrongNote";
	}

	/*
	 * 0* 오답노트 등록 서비스
	 * 
	 * @return
	 */
	@PostMapping("myPage-wrongNote/{wrongNoteNo:[0-9]+}")
	public String insertWrongNote(@SessionAttribute("loginMember") Member loginMember, Model model,
			@ModelAttribute WrongNoteDTO wrongNote, RedirectAttributes ra) {

		// 로그인 멤버 NO wrongNote 객체에 담기
		wrongNote.setMemberNo(loginMember.getMemberNo());

		// 서비스 호출
		int result = wroService.insertWrongNote(wrongNote);

		String message = null;
		String path = null;

		// 성공 시
		if (result > 0) {

			message = "오답노트 정보 등록 완료";
			ra.addFlashAttribute("message", message);
			path = "redirect:/myPage/myPage-wrongNote/" + wrongNote.getWrongNoteNo();

		} else {

			message = "오답노트 정보 등록 실패";
			ra.addFlashAttribute("message", message);
			path = "redirect:/myPage/myPage-wrongNote/" + wrongNote.getWrongNoteNo();

		}

		return path;
	}
	
	/** 시간표 등록 서비스
	 * @param loginMember 
	 * @param map
	 * @return
	 */
	@PostMapping("timetable/insert")
	@ResponseBody
	public int insertTimetable(@SessionAttribute("loginMember") Member loginMember, @RequestBody Map<String, Object> map) {
		int memberNo = loginMember.getMemberNo();
		return timetableService.insertTimetable(map, memberNo);
	}
	
	/** 시간표 조회 서비스(비동기)
	 * @param loginMember
	 * @param map
	 * @return
	 */
	@ResponseBody
	@GetMapping("timetable/select")
	public Map<String, Object> selectTimetable(@SessionAttribute("loginMember") Member loginMember, 
											  @RequestParam Map<String, Object> map,
											  Model model){
		
		
		// 여기서 (String) 으로 강제형변환 했다가 오류났었음
		String year = String.valueOf(map.get("year"));
		String period = String.valueOf(map.get("semester"));
		String semester = year+"-"+period;
		
		int memberNo = loginMember.getMemberNo();
		
		map.put("memberNo", memberNo);
		map.put("semester", semester);
		
		List<TimetableDTO> timetableDTOLists = timetableService.selectTimetable(memberNo, semester);
		
		// 3-1. 만약 조회된 데이터가 없을 때
		Map<String, Object> fetchMap = new HashMap<String, Object>();
		
		// 조회된 결과가 없을 경우 처리
		if(timetableDTOLists.size() == 0) {
			
			String[][] timetableDoubleArray = new String[6][7]; 
			for(int i = 0; i < 6; i++) {
				Arrays.fill(timetableDoubleArray[i], "미설정"); 
			}
			
			fetchMap.put("fullTimetable", timetableDoubleArray);
			log.debug(fetchMap.toString());
			return fetchMap;
			// 비동기 요청에서는 전달받은 semester 그대로 전달
			// model.addAttribute("semesterStr", semester);
		
		} else { // 3-2. 조회된 결과 있다면
			String[][] timetableDoubleArray = new String[6][7];
			for(int i = 0; i < 6; i++) {
				Arrays.fill(timetableDoubleArray[i], "미설정"); // 모든 행(i, day, 요일) 에 미설정 채워넣기 
			}
			
			for(TimetableDTO temp : timetableDTOLists) { // 가져온 DTO 객체 하나씩 돌면서 과목이 있을 때만 "미설정" 대신 해당 과목 채워넣기
				int row = temp.getDay() - 1; // 인덱스로 반환 (0~5)
				int col = temp.getCls() - 1; // 인덱스로 반환 (0~6)
				
				if(row >= 0 && row < 6 && col >= 0 && col < 7) {
					timetableDoubleArray[row][col] = temp.getSubject(); // 이중 배열 특정 칸에 가져온 과목 넣기
				}
				
			}
			
			// model 에 담아 전달
			fetchMap.put("fullTimetable", timetableDoubleArray);
			log.debug(fetchMap.toString());
			
			return fetchMap;
			// 비동기 요청에서는 전달받은 semester 그대로 전달
			// model.addAttribute("semesterStr", semester);
		}
			
	}
		
	
	

	
// ------------------------------------------------------------------------------	
	
	/** 일기장 작성일 형식 및 중복 확인 메서드 (***** 조립해서 쓸것 ******)
	 * @param loginMember
	 * @param model
	 * @param inputDiary
	 * @param ra
	 * @return
	 */
/*	public String checkWhiteDate(@SessionAttribute("loginMember") Member loginMember,
			Model model,
			@ModelAttribute DiaryDTO inputDiary, 
	        RedirectAttributes ra) { 
		int memberNo = loginMember.getMemberNo();
		inputDiary.setMemberNo(memberNo);
		int result = 0;
		String message = null;
		// *추가 - 숫자가 아닌 문자가 들어온 경우

		// *추가 - 2000이상의 값으로 시작하지 않는 경우
		
		
		// 8자리보다 크거나 작은 숫자를 입력한 경우
		if(inputDiary.getDiaryDate().length() != 8) {
			
		
			message = "YYYYMMDD형식의 8자리 작성일을 입력해주세요";
			ra.addFlashAttribute("message", message);
			return "redirect:/myPage";
		
		// 작성한 날짜에 이미 작성한 일기가 존재하는 경우
		} else if(result == 1) {
		

			
			result = diaryService.checkWhiteDate(inputDiary);
			

			message = "이미 회원님이 일기를 작성한 날이에요";
			ra.addFlashAttribute("message", message);
			return "redirect:/myPage";
		} else {
			

		
		}
	}
*/	
	
	
	
	
	/** 일기장 내용 저장/수정
	 * @param loginMember
	 * @param model
	 * @return
	 */
	@PostMapping("diary/insertDiary")
	public String insertDiary(@SessionAttribute("loginMember") Member loginMember,
			Model model,
			@ModelAttribute DiaryDTO inputDiary,
	        RedirectAttributes ra) { 
		
		log.debug("입력합 : " + inputDiary);
		
		String message = null;	
		int memberNo = loginMember.getMemberNo();
		String inputDiaryDate = inputDiary.getDiaryDate().strip(); // **** 트러블 슈팅에 이용
		
		inputDiary.setDiaryDate(inputDiaryDate);
		inputDiary.setMemberNo(memberNo);
		
	    int result = 0;
	    


		// 입력할 날짜가 비어있는 경우
		if (inputDiary.getDiaryDate() == "") {
			message = "삭제할 날짜를 입력해주세요.";
	        return "redirect:/myPage";
	    }
	    
		//  길이가 8이 아니거나 / 숫자가 아닌 문자가 포함되어 있다면
		if(!inputDiary.getDiaryDate().matches("\\d+") || inputDiary.getDiaryDate().length() != 8){
		    
			message = "YYYYMMDD형식의 8자리 작성일을 입력해주세요";
			ra.addFlashAttribute("message", message);
			return "redirect:/myPage";
		
		} 
	
		result = diaryService.checkWriteDate(inputDiary);
		
		// 해당일에 이미 작성한 이메일이 있는 경우
		if(result == 1) {	

			message = "이미 회원님이 일기를 작성한 날이에요";
			ra.addFlashAttribute("message", message);
			return "redirect:/myPage";
			
		}else {
		
			result = diaryService.insertDiary(inputDiary);
			log.debug("저장 결과 : " + result);
			
			
			if(result > 0) {
				message = "일기가 성공적으로 저장되었습니다.";
			} else {
				message = "일기 저장에 실패했습니다. ";
			}
			
			ra.addFlashAttribute("message", message);
			

			return "redirect:/myPage"; 
			
		}
			
	}	
			
			
	/*
	 * 		// 게시글 상세 조회 서비스 호출
		// 1) Map으로 전달할 파라미터 묶기
		Map<String, Integer> map = new HashMap<>();
		map.put("boardCode", boardCode);
		map.put("boardNo", boardNo);
		
		// 로그인 상태인 경우에만 memberNo를 map 추가
		// LIKE_CHECK시 이용 (로그인한 사람이 좋아요 누른 게시글인지 체크하기 위함)
		if(loginMember != null) {
			map.put("memberNo", loginMember.getMemberNo());
		}
		
		// 2) 서비스 호출
		Board board = service.selectOne(map);
		
		//log.debug("조회된 board : " + board);
		
		String path = null;
		
		// 조회 결과가 없는 경우
		if(board == null) {
			path = "redirect:/board/" + boardCode; 
			// 내가 현재 보고있는 게시판목록으로 재요청
			ra.addFlashAttribute("message", "게시글이 존재하지 않습니다");
			
		} else { // 조회 결과가 있는 경우
			//------------------ 쿠키를 이용한 조회 수 증가 시작 ------------------
			// 비회원 또는 로그인한 회원의 글이 아닌 경우 (== 글쓴이를 뺀 다른 사람)
	 * 
	 * 
	 * 
	 * */	
		

	/** 동기부여 글 스타일변경
	 * @param loginMember
	 * @param inputFont
	 * @return
	 */
	@ResponseBody
	@PostMapping("changeFont")
	public FontDTO changeFont(@SessionAttribute("loginMember") Member loginMember,
            @RequestBody FontDTO inputQuotes) {	
			
			int memberNo = loginMember.getMemberNo();		
		
			inputQuotes.setMemberNo(memberNo);
				
			int result = diaryService.updateQuotes(inputQuotes);
						
			log.debug("inputQuotes : " + inputQuotes);
			
			return inputQuotes;

	}
	

	
//	@PostMapping("diary/selectDiary")
//	public DiaryDTO selectDiary(@SessionAttribute("loginMember") Member loginMember,
//	                            @RequestBody DiaryDTO inputDiary
//	                            ) { 
//		log.info("넘어온 날짜: " + inputDiary.getDiaryDate());
//		
//		int memberNo = loginMember.getMemberNo();
//		String inputDiaryDate = inputDiary.getDiaryDate().strip(); // **** 트러블 슈팅에 이용
//		inputDiary.setDiaryDate(inputDiaryDate);
//	    inputDiary.setMemberNo(loginMember.getMemberNo());
//	    
//	    DiaryDTO result = diaryService.selectDiary(inputDiary);
//	    
//	    // 1. 서비스 호출 (결과를 DTO 객체로 받음)
//	    DiaryDTO diary = diaryService.selectDiary(inputDiary);
//	    
//	    if(diary != null) {
//
////	        model.addAttribute("diary", diary);
////	        return "redirect:/myPage";
//	    } else {
//	        ra.addFlashAttribute("message", "해당 날짜에 작성된 일기가 없습니다.");
//	        return "redirect:/myPage"; 
//	    }
//	}



	/** 일기 내용 삭제
	 * @param loginMember
	 * @param model
	 * @param inputDiary
	 * @param ra
	 * @return
	 */
	@PostMapping("diary/deleteDiary")
	public String deleteDiary(@SessionAttribute("loginMember") Member loginMember,
			Model model, 
	        @ModelAttribute DiaryDTO inputDiary,
	        RedirectAttributes ra) { 
		
		String message = null;		
		int memberNo = loginMember.getMemberNo();
		String inputDiaryDate = inputDiary.getDiaryDate().strip(); // **** 트러블 슈팅에 이용
		inputDiary.setDiaryDate(inputDiaryDate);
		inputDiary.setMemberNo(memberNo);
		
		int result = diaryService.deleteDiary(inputDiary);
		    
		if(result > 0) {
			message = "일기가 성공적으로 삭제되었습니다.";
		} else {
			message = "일기 삭제가 실패했습니다.";
		}
		    
		ra.addFlashAttribute("message", message);
	
		return "redirect:/myPage";
		
	}
	
	
	// seongjong

//--------------------------------------------------------------------------------------------------------------

	/**
	 * 마이페이지 프로필 수정 화면으로 이동
	 * 
	 * @author dasol
	 * @param loginMember
	 * @return
	 */
	@GetMapping("info") // /myPage/info
	public String info(@SessionAttribute("loginMember") Member loginMember, Model model) {

		// 현재 로그인한 회원의 주소를 꺼내옴
		// 현재 로그인한 회원 정보 -> session scope 에 등록된 상태(loginMember)
		// loginMember(memberAddress도 포함)
		// -> 만약 회원가입 당시 주소를 입력했다면 주소값 문자열(^^^ 구분자로 만들어진 문자열)
		// -> 회원가입 당시 주소를 입력하지 않았다면 null
		String memberAddress = loginMember.getMemberAddress();
		// 03189^^^서울 종로구 우정국로2길 21^^^3층, 302클래스 (대왕빌딩)
		// or null

		if (memberAddress != null) { // 주소가 있을 경우에만 동작
			// 구분자 "^^^" 를 기준으로
			// memberAddress 값을 쪼개어 String[] 로 반환
			String[] arr = memberAddress.split("\\^\\^\\^");
			// ["03189", "서울 종로구 우정국로2길 21", "3층, 302호 클래스 (대왕빌딩)"]

			model.addAttribute("postcode", arr[0]); // 우편주소
			model.addAttribute("address", arr[1]); // 도로명/지번주소
			model.addAttribute("detailAddress", arr[2]); // 상세주소
		}

		return "myPage/myPage-info";
	}

	/**
	 * 회원 정보 수정
	 * 
	 * @param member
	 * @param memberAddress : 주소만 따로 배열 형태로 얻어옴
	 * @param loginMember   : 현재 로그인한 회원의 회원번호(PK) 사용
	 * @return
	 */
	@PostMapping("info") // /myPage/info POST 방식 요청 매핑
	public String updateInfo(@ModelAttribute Member member, @RequestParam("memberAddress") String[] memberAddress,
			@SessionAttribute("loginMember") Member loginMember, RedirectAttributes ra) {

		// Member 에 현재 로그인한 회원 번호 추가
		member.setMemberNo(loginMember.getMemberNo());
		// member : 수정된 회원의 닉네임, 수정된 회원의 전화번호, [주소], 회원번호

		// 회원 정보 수정 서비스 호출
		int result = myPageService.updateInfo(member, memberAddress);

		String message = null;

		if (result > 0) {
			message = "회원 정보 수정 성공";

			loginMember.setMemberNickname(member.getMemberNickname());
			loginMember.setMemberTel(member.getMemberTel());
			loginMember.setMemberAddress(member.getMemberAddress());

		} else {
			
			message = "회원 정보 수정 실패";

		}

		ra.addFlashAttribute("message", message);

		return "redirect:info"; // 재요청 경로 : /myPage/info GET 요청
	}

	 // 비밀번호 변경 화면 이동
	@GetMapping("changePw")
	public String changePw() {
	
		return "myPage/myPage-changePw";
	}

	// 비밀번호 변경
	@PostMapping("changePw")
	public String changePw(@RequestParam Map<String, Object> paramMap,
			@SessionAttribute("loginMember") Member loginMember, RedirectAttributes ra) {

		// 로그인한 회원 번호
		int memberNo = loginMember.getMemberNo();

		// 서비스 호출
		int result = myPageService.changePw(paramMap, memberNo);

		String message = null;
		String path = null;

		if (result > 0) {

			message = "비밀번호가 변경되었습니다";
			path = "/myPage/info";

		} else {
			message = "현재 비밀번호가 일치하지 않습니다";
			path = "/myPage/changePw";
		}

		ra.addFlashAttribute("message", message);
		

		return "redirect:" + path;
	}

	// 회원 탈퇴 화면 이동
	@GetMapping("secession")
	public String secession() {
		
		return "myPage/myPage-secession";
	}

	/** 회원 탈퇴
	 * @param memberPw
	 * @param loginMember
	 * @param status : @SessionAttributes({""}) 와 반드시 같이 사용
	 * @param ra
	 * @return
	 */
	@PostMapping("secession") // /myPage/secession POST 요청 매핑
	public String secession(@RequestParam("memberPw") String memberPw,
			@SessionAttribute("loginMember") Member loginMember,
			SessionStatus status,
			RedirectAttributes ra) {

		// 로그인한 회원의 회원번호 꺼내오기
		int memberNo = loginMember.getMemberNo();

		// 서비스 호출 (입력받은 비밀번호, 로그인한 회원번호)
		int result = myPageService.secession(memberPw, memberNo);
		
		String message = null;
		String path = null;
		
		if(result > 0) {
			message = "탈퇴되었습니다.";
			path = "/";
			
			status.setComplete(); // 세션 비우기(로그아웃 상태 변경)
			
		} else {
			
			message = "비밀번호 일치하지 않습니다";
			path = "secession";
		}
		
		ra.addFlashAttribute("message", message);

		return "redirect:" + path;
	}

	
	// 회원 프로필 변경 페이지로 이동
	@GetMapping("profile") // /myPage/profile
	public String profile() {
		
		return "myPage/myPage-profile";
	}
	
	// 회원 프로필 변경
	@PostMapping("profile") // /myPage/profile
	public String profile(@RequestParam("profileImg") MultipartFile profileImg,
						@SessionAttribute("loginMember") Member loginMember,
						RedirectAttributes ra) throws Exception {
	
		// 서비스 호출
		int result = myPageService.profile(profileImg, loginMember);
		
		String message = null;
		
		if(result > 0) {
			message = "변경 성공";
		} else {
			message = "변경 실패";
		}
		
		ra.addFlashAttribute("message", message);
		
		return "redirect:profile"; // 리다이렉트 - /myPage/profile GET 요청
	}
	
	

}
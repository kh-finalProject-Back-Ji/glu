/**/
//  diary 관련 ------------------------------
// --------------------------------------------
// 2. Diary 관련 ------------------------------
function validateDelete() {
	const diaryDate = document.getElementById("diaryDate");
	const dateValue = diaryDate.value.trim();
	const datePattern = /^\d{8}$/;

	// 1. 날짜 검증
	if (!datePattern.test(dateValue)) {
		alert("YYYYMMDD 형식의 8자리 작성일을 숫자로만 입력해주세요.");
		diaryDate.focus();
		return false; // 서버 전송 차단
	}

	// 2. 삭제 확인창
	const isConfirm = confirm("정말 삭제하시겠습니까?");

	if (isConfirm) {
		return true;  // ★ 이 값이 반환되어야 Java 컨트롤러(@PostMapping)가 실행됩니다.
	} else {
		return false; // 취소 시 서버 전송 차단
	}
}

// --------------------------------------------



// Diary 조회관련 비동기
document.addEventListener("DOMContentLoaded", () => {
	const diarySelectBtn = document.getElementById('diary-selectBtn');

	// 요소들을 미리 찾아둡니다.
	const diaryDateInput = document.getElementById('diaryDate');
	const diaryTitleInput = document.getElementById('diaryTitle');
	const diaryContentInput = document.getElementById('diaryContent');

	if (diarySelectBtn) {
		diarySelectBtn.addEventListener('click', () => {
			const diaryDate = diaryDateInput.value.trim();

			if (!diaryDate) {
				alert("조회할 날짜를 입력해주세요.");
				return;
			}

			fetch("/myPage/diary/selectDiary", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ "diaryDate": diaryDate })
			})
				.then(resp => {
					if (!resp.ok) throw new Error("네트워크 응답 에러");
					return resp.text(); // json() 대신 text()로 받기
				})
				.then(text => {
					// 텍스트가 비어있으면 null 반환 (여기서 에러 발생을 막음)
					if (!text || text.trim() === "") return null;
					return JSON.parse(text); // 내용이 있을 때만 파싱
				})
				.then(diary => {
					if (diary) {
						diaryTitleInput.value = diary.diaryTitle || '';
						diaryContentInput.value = diary.diaryContent || '';
						alert("일기를 불러왔습니다.");
					} else {
						alert("해당 날짜에는 일기를 쓰지 않으셨습니다.");
					}
				})
				.catch(err => console.error("에러 발생:", err));
		});
	}
});


// 동기부여글 관련 ------------------------------
const quotesForm = document.getElementById("quotes-form");

if (quotesForm) {
    quotesForm.addEventListener("submit", (e) => {
        e.preventDefault(); // 중요: 폼이 직접 제출되어 페이지 이동되는 걸 막음

        // 1. 데이터 수집 (FontDTO 필드명과 일치시켜야 함)
        const fontData = {
            quotesContent: document.getElementById("quotes-content").value,
            fontSize: document.getElementById("font-size").value,
            fontFamily: document.getElementById("menu-font-menu").value
        };

        // 2. 비동기 요청 전송
        fetch("/myPage/changeFont", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // "나 JSON 보낸다!"고 알림
            body: JSON.stringify(fontData) // 객체를 JSON 문자열로 변환
        })
        .then(resp => {
            if (resp.ok) return resp.json();
            throw new Error("저장 실패");
        })
        .then(result => {
		// result는 서버에서 return한 FontDTO 객체입니다.
		alert("동기부여 글과 스타일이 저장되었습니다!");
		
		const textArea = document.getElementById("quotes-content");

		// 1. 글꼴 크기 반영 (반드시 'px' 단위를 붙여야 합니다)
		if (result.fontSize) {
			textArea.style.fontSize = result.fontSize + "px";
		}

		// 2. 글꼴 종류 반영
		if (result.fontFamily) {
			textArea.style.fontFamily = result.fontFamily;
		}
		
		// 3. 내용 반영 (필요 시)
		textArea.value = result.quotesContent;

		console.log("변경 완료:", textArea.style.fontSize, textArea.style.fontFamily);
	})
        .catch(err => console.error("에러:", err));
    });
}



// --------------------------------------------
function validateDelete() {
	const diaryDate = document.getElementById("diaryDate");
	const dateValue = diaryDate.value.trim();
	const datePattern = /^\d{8}$/;

	// 1. 날짜 검증
	if (!datePattern.test(dateValue)) {
		alert("YYYYMMDD 형식의 8자리 작성일을 숫자로만 입력해주세요.");
		diaryDate.focus();
		return false; // 서버 전송 차단
	}

	// 2. 삭제 확인창
	const isConfirm = confirm("정말 삭제하시겠습니까?");

	if (isConfirm) {
		return true;  // ★ 이 값이 반환되어야 Java 컨트롤러(@PostMapping)가 실행됩니다.
	} else {
		return false; // 취소 시 서버 전송 차단
	}
}



// --------------------------------------------
// 1. calender 관련 ------------------------------
// 오늘 날짜 생성
let today = new Date();
let year = today.getFullYear();
let month = today.getMonth() + 1;
// test: console.log(today);
// tbody 변수 저장
let tbody = document.querySelector(".calender-table-body");

// 1-1. 캘린더 및 연월 생성 부분 -------------------------
callCalender();
callYearMonth();

// 1-2. 캘린더 왼쪽 오른쪽 클릭 부분 -------------------------
const rightBtn = document.querySelector("#calender-right-btn");
const leftBtn = document.querySelector("#calender-left-btn");

rightBtn.addEventListener("click", () => {
	today.setMonth(today.getMonth() + 1);
	year = today.getFullYear();
	month = today.getMonth() + 1;
	tbody.innerHTML = "";
	callCalender();
	callYearMonth();
});

leftBtn.addEventListener("click", () => {
	today.setMonth(today.getMonth() - 1);
	year = today.getFullYear();
	month = today.getMonth() + 1;
	tbody.innerHTML = "";
	callCalender();
	callYearMonth();
});

// function. 캘린더 상단 연월 출력 함수
function callYearMonth() {
	document.querySelector("#calender-year").innerText = String(year) + "년";
	document.querySelector("#calender-month").innerText = String(month) + "월";
};

// function. 캘린더 호출 함수
function callCalender() {

	// 현재 월 기준 첫째 날짜 및 마지막 날짜 구하기
	let firstDate = new Date(year, month - 1, 1).getDate(); // 1월이면 1
	let lastDate = new Date(year, month, 0).getDate(); // 1월이면 31

	// 현재 월 기준 첫날, 마지막 날 요일 구하기
	let firstDay = new Date(year, month - 1, 1).getDay(); // 일(0) ~ 토(6)
	let lastDay = new Date(year, month, 0).getDay();  // 일(0) ~ 토(6)

	// js 에서 일요일은 0이므로 7로 바꿔주기
	if (firstDay == 0) firstDay = 7;
	if (lastDay == 0) lastDay = 7;

	// console.log(firstDate);
	// console.log(lastDate);
	// console.log(firstDay);
	// console.log(lastDay);

	// 시작 날짜 변수 저장
	let calDate = 1;

	// calender 표 생성
	// for문으로 날짜가 있는 요일만 클래스 구분 후 날짜 채우기
	for (let i = 1; i <= 6; i++) { // tr 생성 (총 6행)
		const tr = document.createElement("tr");
		tbody.append(tr);
		for (let j = 1; j <= 7; j++) { // tr 별로 td 생성
			const td = document.createElement("td");
			td.classList.add("tdEmpty");
			tr.append(td);
		}
	}

	// tr 배열 생성
	const trList = Array.from(tbody.children);
	// console.log(trRow);

	for (i = 0; i < trList.length; i++) { // tr은 무조건 6행까지만 생성되었으므로 총 6줄만 돌게 됨

		// td 배열 생성
		let tdList = Array.from(trList[i].children);

		if (i == 0) { // tr 이 첫행인 경우에 시작날짜 이용해 빈 날짜는 비워주기(목요일 시작인 경우 월화수 비우기)
			for (let j = firstDay; j <= 7; j++) {
				tdList[j - 1].classList.add("tdNormal");
				tdList[j - 1].classList.remove("tdEmpty");
				tdList[j - 1].innerText = calDate;
				calDate++;
			}
		}

		if (i > 0) { // tr 첫번째 줄을 제외한 나머지 줄 채워주기
			for (let j = 1; j <= 7; j++) {
				tdList[j - 1].classList.add("tdNormal");
				tdList[j - 1].classList.remove("tdEmpty");
				tdList[j - 1].innerText = calDate;
				calDate++;
				if (calDate > lastDate) break; // 만약 해당 월 마지막 날짜를 초과 시 break
			}
		}

		if (calDate > lastDate) break;
	}

	calenderSchedule();

};

// 캘린더 스케쥴 부분
function calenderSchedule() {
	// tbody 내 전체 td list 로 저장(총 42개)
	const allTdList = Array.from(tbody.querySelectorAll("td"));

	for (let i = 0; i < allTdList.length; i++) {

		// 모든 td 돌면서 공백인 td 는 지나치기
		if (allTdList[i].innerText == 0) continue;

		let tdDay = Number(allTdList[i].innerText);
		// console.log("tdday :" , tdDay);
		let compareDate = new Date(year, month, tdDay);

		//console.log(calenderList);

		// 서버에서 넘어온 calenderList 돌기
		for (const schedule of calenderList) {
			let startDate = new Date(schedule.startYear, schedule.startMonth - 1, schedule.startDay);
			// console.log(startDate);
			let endDate = new Date(schedule.endYear, schedule.endMonth - 1, schedule.endDay);

			// console.log(startDate);

			if (startDate.getFullYear() == year && startDate.getMonth() + 1 == month && startDate.getDate() == tdDay) {

				//console.log(startDate.getDate());
				const div = document.createElement("div")
				allTdList[i].append(div);
				div.classList.add("calender-td-content");
				div.innerText = schedule.calenderContent;
			}
		}

	}

}
// 시간표 부분----------------------------------------------
// --------------------------------------------------------

// 1. 서버로부터 전달된 학기 정보 저장하여 html로 출력

let timetableYear = Number(semesterStr.substring(0,4)); // 2026
let timetableSemester = Number(semesterStr.substring(5,6)); // 1
const tagSemesterYear = document.querySelector("#semesterYear");
const tagSemesterPeriod = document.querySelector("#semesterPeriod");

viewSemester();

function viewSemester(){
	tagSemesterYear.innerText = timetableYear;
	tagSemesterPeriod.innerText = timetableSemester;
}

// ------

// 2. 수정버튼 누를 시 수정화면으로 전환
const ttEdit = document.querySelector("#semester-edit-btn");

ttEdit.addEventListener("click",() => {
	const saveBtn = document.createElement("button");
	saveBtn.innerText="저장";
	document.querySelector("#semester-edit-area").append(saveBtn);
	
	changeSubjectInput();
	const obj2 = changeSemester();

	saveBtn.addEventListener("click",()=>{
		saveTimetable(obj2);
		location.reload();
	});

});

// function. 수정버튼 누를 시 연도, 학기 부분 select 창으로 변화 후 전달
function changeSemester(){
	const select_year = document.createElement("select");
	const select_period = document.createElement("select");

	// 학기 부분
	select_period.type="text";
	select_period.placeholder = timetableSemester;
	
	const p_opt_1 = document.createElement("option");
	p_opt_1.value = 1;
	p_opt_1.innerText = 1;
	const p_opt_2 = document.createElement("option");
	p_opt_2.value = 2;
	p_opt_2.innerText = 2;
	select_period.append(p_opt_1, p_opt_2);

	select_period.id="select-semesterPeriod";
	tagSemesterPeriod.replaceWith(select_period);

	// 연도 부분
	select_year.type="text";
	select_year.placeholder = Number(today.getFullYear());

	for(let i = -3; i < 4; i++){
		const y_opt = document.createElement("option");
		y_opt.value	= Number(today.getFullYear()) + i;
		y_opt.innerText = Number(today.getFullYear()) + i;
		select_year.append(y_opt);
	}

	select_year.id="input-semesterYear";
	tagSemesterYear.replaceWith(select_year);

	const y = select_year.value;
	const p = select_period.value;
	
	const obj2 = {"tyear" : y, "tperiod" : p};
	return obj2;
}

// function. 등록버튼 누를 시 input 창으로 변화(변화만 함)
function changeSubjectInput(){

	// 모든 과목 영역 선택(.subject)
	const allSubject = document.querySelectorAll(".subject");
	// 반복문으로 하나씩 돌며 바꾸기
	allSubject.forEach(sub_span => { // 현재 span 태그 변수명
		const sub_input = document.createElement("input");
		sub_input.type="text";
		if(sub_span.innerText.trim() === "미설정"){
			sub_input.value="";
		}else{
			sub_input.value=sub_span.innerText.trim(); // 현재값
		}
		sub_input.id=sub_span.id;
		sub_input.className="subject-input";
		sub_span.replaceWith(sub_input); // 교체
	});
}

// 저장버튼 누를 시 비동기 요청으로 저장
function saveTimetable(obj2){

	// 비동기요청으로 보낼 json에 담길 빈 객체 선언
	const obj1 = {};
	// 모든 input 선택
	const all_sub_input = document.querySelectorAll(".subject-input");
	// 하나씩 돌면서 저장 obj 에 저장 -> { "12" : "12", ....}
	all_sub_input.forEach(temp => {
		if(temp.value == "미설정") return;
		let tday = temp.id.substring(3,4); // 해당 input id의 day 추출 day1cls2 > 1
		let tcls = temp.id.substring(7,8); // 해당 input id의 cls 추출 day1cls2 > 2
		obj1[tday+tcls] = temp.value;
	});

	// 스프레드 사용
	 // > key, value 가 저장된 객체를 모아 요소를 풀어놓은 다음 
	 // 하나의 key value로 구성된 객체에 저장
	 // 사용법 : ...[변수]
	const obj3 = {...obj2, ...obj1};
	console.log(obj3);
	// test : console.log(obj3);
	fetch("myPage/timetable/insert", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(obj3)
	})
	.then(resp => resp.text())
	.then(result => {
		if(result == 0) alert("저장 실패");
		else alert("저장 성공!");
	});
	
}

// 시간표 부분 왼쪽 오른쪽 조회 처리
const sem_left = document.querySelector("#sem-left");
const sem_right = document.querySelector("#sem-right");
const flagYear = timetableYear;

sem_left.addEventListener("click", (e) => {
	
	let nextYear = timetableYear;
	let nextSemester = timetableSemester;

	if(timetableSemester == 1){
		nextYear -= 1;
		nextSemester = 2;
	}else{
		nextSemester = 1;
	}
	
	if(Math.abs(flagYear - nextYear) > 2) {
        alert("조회할 수 있는 년도는 최대 3년입니다");
        e.preventDefault();
        return;
    }

	timetableYear = nextYear;
    timetableSemester = nextSemester;
	viewSemester();

	let param = new URLSearchParams({
		year : timetableYear,
		semester : timetableSemester
	}).toString();

	fetch(`/myPage/timetable/select?${param}`)
	.then(resp => {
		if(resp.ok) return resp.json();
	})
	.then(data => { 
		for(let i = 0; i < 6; i++){
			for(let j = 0; j < 7; j++){
				const sub_tag = document.querySelector(`#day${i+1}cls${j+1}`);
				sub_tag.innerText = data.fullTimetable[i][j];
			}
		}
		
	});
	
});

sem_right.addEventListener("click", (e) => {

	let nextYear = timetableYear;
	let nextSemester = timetableSemester;

	if(nextSemester == 1){
		nextSemester = 2;
	}else{
		nextYear += 1;
		nextSemester = 1;
	}

	if(Math.abs(flagYear - nextYear) > 3) {
        alert("조회할 수 있는 년도는 최대 3년입니다");
        e.preventDefault();
        return;
    }

	timetableYear = nextYear;
    timetableSemester = nextSemester;
	viewSemester();

	// 쿼리스트링 설정
	let param = new URLSearchParams({
		year : timetableYear,
		semester : timetableSemester
	}).toString();

	fetch(`/myPage/timetable/select?${param}`)
	.then(resp => {
		if(resp.ok) return resp.json();
	})
	.then(data => { 
		for(let i = 0; i < 6; i++){
			for(let j = 0; j < 7; j++){
				const sub_tag = document.querySelector(`#day${i+1}cls${j+1}`);
				sub_tag.innerText = data.fullTimetable[i][j];
			}
		}

	});

});




// 오답노트 등록 창 열고 닫는 부분
document.querySelector("#wrongNote-add-window-close")
        .addEventListener("click", () => {
    document.querySelector("#wrongNote-add-window").classList.add("w-hidden");
    document.querySelector("#wrongNote-add-window").classList.remove("w-show");
});

document.querySelector("#addBtn")
        .addEventListener("click", () => {
    document.querySelector("#wrongNote-add-window").classList.remove("w-hidden");
    document.querySelector("#wrongNote-add-window").classList.hidden("w-show");
});

// ------------------------------------------
// 오답노트 왼쪽 오른쪽 클릭 시 조회하는 부분
const rightBtn = document.querySelector("#rightBtn");
const leftBtn = document.querySelector("#leftBtn");

// wrongNoteNo 만 담긴 list 생성
const wrongNoteNolist = [];

for(const temp of wrongNoteList){
	wrongNoteNolist.push(temp.wrongNoteNo);
}
// test: console.log(wrongNoteNolist);

// 현재 URL 의 맨 마지막 숫자(wrongNoteNo) 가져오기
	// window.location.pathname : 현재 주소창 URL
	// split('/') : 가져온 주소창을 '/' 기준으로 자르기
	// pop() : 잘라진 주소의 맨 마지막 부분 가져오기
	// parseInt : int 형으로 변경
const cpNo = parseInt(window.location.pathname.split('/').pop());

// i의 값을 현재 페이지에 해당하는 값으로 대입
let i = wrongNoteNolist.indexOf(cpNo);

rightBtn.addEventListener("click", (e) => {
	
	// 현재 페이지의 마지막 url 이 list 의 첫번째와 같다면 (페이지 이동 막기)	
	if(cpNo == wrongNoteNolist[0]){
		alert("첫번째 페이지입니다");
		e.preventDefault();
	
	// 아니라면 이동
 	}else{
		i--;
		location.href = "/myPage/myPage-wrongNote/" + wrongNoteNolist[i];	
	}
	
});

leftBtn.addEventListener("click", (e) => {
	
	if(cpNo == wrongNoteNolist[wrongNoteNolist.length - 1]){
		alert("마지막 페이지입니다");
		e.preventDefault();
		
	}else{
		i++;
		location.href = "/myPage/myPage-wrongNote/" + wrongNoteNolist[i];
	
	}

});

// 새로고침(페이지 이동 시마다 실행되는 함수 설정)




// js 쿠키 완료 ( dasol )

// 쿠키에서 매개변수로 전달받은 key가 일치하는 value 얻어오는 함수
const getCookie = (key) => {

  const cookies = document.cookie; // "K=V; K=V; ...."

  // console.log(cookies); // saveId=ads1213@kh.or.kr; testKey=testValue

  // cookies 문자열을 배열 형태로 변환
  // split : 문자열을 배열로 만들어 줌
  const cookieList = cookies.split("; ") // ["K=V", "K=V"...]
  .map( el => el.split("=")); // ["K", "V"]...

  console.log(cookieList);

  // ['saveId', 'ads1213@gmail.co.kr'],
  // ['testKey', 'testValue']

  // 배열.map(함수) : 배열의 각 요소를 이용해 함수 수행 후
  //        결과 값으로 새로운 배열을 만들어서 반환

  // 배열 -> 객체로 변환 (그래야 다루기 쉽다)

  const obj = {}; // 비어있는 객체 선언

  for(let i=0; i < cookieList.length; i++) {
    const k = cookieList[i][0]; // key 값
    const v = cookieList[i][1]; // value 값
    obj[k] = v; // 객체에 추가
    // obj["saveId"] = "ads1213@gmail.com";
    // obj["testKey"] = "testValue";
  }

  console.log(obj);
  
  return obj[key]; // 매개변수로 전달받은 key와
  // obj 객체에 저장된 key 가 일치하는 요소의 value 값 반환

}


// 이메일 작성 input 태그 요소
const loginEmail = document.querySelector("#login-form input[name='memberEmail']");

if(loginEmail != null) { // 로그인이 안 되어 있는 화면일 때
  console.log("로그인 이메일창 발견! 쿠키를 찾기 시작합니다."); 
  
  // 쿠키 중 key 값이 "saveId"인 쿠키의 value 얻어오기
  const saveId = getCookie("saveId"); // 이메일 또는 undefined

  // saveId 값이 있을 경우
  if(saveId != undefined) {
	console.log("찾은 쿠키값:", saveId);
    // 쿠키에서 얻어온 이메일 값을 input 요소의 value 세팅
    loginEmail.value = saveId;

    // 아이디 저장 체크박스에 체크해두기
    document.querySelector("input[name='saveId']").checked = true;
  } 

}

// 쿠키 js 완료 ( dasol )
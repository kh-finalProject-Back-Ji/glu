// 인증번호 발송 함수
function sendAuthCode() {
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;

    if(!name || !email) {
        alert("이름과 이메일을 모두 입력해 주세요.");
        return;
    }

    // 서버에 아이디 찾기 요청 (이름/이메일 일치 확인 후 메일 발송)
    fetch('/member/find-id/send-code', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ memberName: name, memberEmail: email })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert("인증번호가 발송되었습니다.");
            document.getElementById('authCodeSection').style.display = 'block';
            startTimer(); // 타이머 작동 (필요시 구현)
        } else {
            alert(data.message); // "일치하는 회원 정보가 없습니다" 등
        }
    });
}

// 인증번호 확인 함수
function verifyAuthCode() {
    const code = document.getElementById('authCode').value;
    const email = document.getElementById('memberEmail').value;

    fetch('/member/find-id/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email, authCode: code })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            // 인증 성공 시 아이디 보여주기
            document.getElementById('resultArea').style.display = 'block';
            document.getElementById('foundId').innerText = data.userId;
            document.getElementById('sendAuthBtn').disabled = true;
        } else {
            alert("인증번호가 일치하지 않습니다.");
        }
    });
}
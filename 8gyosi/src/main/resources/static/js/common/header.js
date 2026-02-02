// 로그인 창 관련
const loginlink = document.querySelector("#login-link");
const loginwindow = document.querySelector("#login-window");
const loginwindowclose = document.querySelector("#login-window-close");


// 로그인 창이 없을 경우 조건문
if (loginlink != null) {
  loginlink.addEventListener("click", (e) => {
    loginwindow.classList.add("show");
    loginwindow.classList.remove("hidden");
  });
}

loginwindowclose.addEventListener("click", (e) => {
  loginwindow.classList.add("hidden");
  loginwindow.classList.remove("show");
});


const loginbtn = document.querySelector("login-btn")

if (loginbtn != null) {
  loginbtn.addEventListener("click", (e) => {
    location.href = `/8gyosi/login`;
  });
}

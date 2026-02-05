import "../styles/Login.css";

export const Login = () => {
  return (
    <div className="Login">
      <div className="login-container">
        <div>
			    <div>Good Sugar</div>
			    <button id="login-window-close">&times;</button>
		    </div>
        <form className="login-form" method="POST">
          <fieldset className="login-area">
            이메일
            <input></input>
            비밀번호
            <input></input>
          </fieldset>
        </form>
      </div>  
    </div>
  )
}
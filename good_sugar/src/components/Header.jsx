import React from "react";
import '../styles/Header.css'
import { Link } from "react-router-dom";
import Logo from '../assets/LOGO.png'

function Header() {
  return (
    <div className="header">
      <Link to="/">
        <img src={Logo} className="logo"/>
      </Link>
    </div>
  )
}

export default Header
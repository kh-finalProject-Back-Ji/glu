import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"

function Home() {
  return(
    <div className="home">
      <div className="headerContainer" >
        <div className="headerContainer">
          <h1>
            Pizza House
          </h1>
          <p>Taste the Finest Pizza</p>
          <Link to="/menu">
            <button>ORDER NOW</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
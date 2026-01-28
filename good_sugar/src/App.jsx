import './App.css';
import React, { useEffect, useState } from 'react';
import axios, { formToJSON } from 'axios';
import {  BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home'
import Header from './components/Header'
import Footer from './components/Footer';

function App() {
   const [connection, setConnection] = useState("");

  const connectionTest = () => {
    axios
      .get("http://localhost:12345")
      .then((response) => {
        setConnection(response.data);
      })
      .catch((error) => {
        setConnection(error.message);
      });
  };
  useEffect(()=>{
    connectionTest();
  });

  return (
    <div className='app'>
      <div style={{ backgroundColor: '#eee', padding: '10px' }}>
        서버 상태: {connection}
      </div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={ <Home /> } />
        </Routes>
      <Footer />
      </Router>
    </div>
  );
}

export default App;

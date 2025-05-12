import React, { useState, useEffect } from "react";
import '../App.css';
import Logo from '../assets/logo.png';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginUser: "",
    loginPassword: ""
  });
  const [loggedIn, setLoggedIn] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if(data.success){
      setFormData({ loginUser: "", loginPassword: "" });
      alert("Login Successful!");
      navigate("/home");
    }
    else{
      setFormData({ loginUser: "", loginPassword: "" });
      alert("Invalid login");
    }
    
  };

  useEffect(() => {
    const isLoggedIn = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/loggedIn', {
          method: 'GET',
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        if (data.loggedIn) {
          alert("You are already logged in");
          setLoggedIn(true);
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    isLoggedIn();
  }, [navigate]);


  return (
    <div className="page-wrapper">
      <div className="login-container">
        <div>
          <img src={Logo} alt="Logo" width="100" height="100" />
        </div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="loginUser"
              value={formData.loginUser}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              name="loginPassword"
              value={formData.loginPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="login_button">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
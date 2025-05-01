import React, { useState } from "react";
import '../App.css';
import Logo from '../assets/logo.png';

function Login() {
  const [formData, setFormData] = useState({
    loginUser: "",
    loginPassword: ""
  });

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
      body: JSON.stringify(formData)
    });
    setFormData({ loginUser: "", loginPassword: "" });
    console.log("Logging in with:", response);
  };

  return (
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
  );
}

export default Login;

import React, { useState } from "react";
import '../App.css'; 
import Logo from '../assets/logo.png'; 

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
    // Add login logic here
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
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
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

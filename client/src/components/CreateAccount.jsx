import React, { useState, useEffect } from "react";
import '../App.css';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Logo from '../assets/logo.png';



function CreateAccount() {
    /* email username pasword confirm password 
signup button */
    const [formData, setFormData] = useState({
        loginUser: "",
        loginPassword: "",
        loginEmail: "",
        confirmPassword: ""
    });
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
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
                    navigate("/home");
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        isLoggedIn();
    }, [navigate]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:3000/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if(data.success){
            setFormData({ loginUser: "", loginPassword: "", loginEmail: "", confirmPassword: "" });
            alert("Account Created Successfully!");
            navigate("/");
        }
        else{
            setFormData({ loginUser: "", loginPassword: "", loginEmail: "", confirmPassword: "" });
            let alertString = "Error when creating account: " + data.error;
            alert(alertString);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="login-container">
                <div>
                    <img src={Logo} alt="Logo" width="100" height="100" />
                </div>
                <h2>Create Account</h2>
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
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Create Account</button>
                </form>
            </div>
        </div>
    )
}











export default CreateAccount
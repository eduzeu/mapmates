import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
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
          if (!data.loggedIn) {
            alert("You need to be logged in to access this page");
            navigate("/signin");
          }
        } catch (err) {
          console.error("Error logging out:", err);
        }
      };
      const logout = async () => {
        try{
          const response = await fetch('http://localhost:3000/users/loggedIn', {
            method: 'GET',
            credentials: "include"
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data);
          if (!data.success){
            throw new Error(data.error);
          }
          else{
            alert("Logged out successfully");
            navigate("/signin");
          }
        } catch (err) {
          console.error("Error logging out:", err)
        }
      }
      isLoggedIn();
      logout();
    }, [navigate]);
  return (
    <div></div>
  );
}
export default Logout;
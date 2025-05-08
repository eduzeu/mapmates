import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Home() {
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
        if (!data.loggedIn) {
          alert("You need to be logged in to access this page");
          setLoggedIn(false);
          navigate("/signin");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    isLoggedIn();
  }, [navigate]);
  return (
    <>
      <h1> Welcome To MapMates :)</h1>
      <p className="description"> At MapMates, you  have an interactive map displaying Hoboken Restaurants. You can head to the Restaurants by copying the
        addres displayed when you click the pin. Once you visit a resturant, you can review it and it will count as
        a visit. You can also add your own restaurant if you want to share it with the Stevens Community! </p>
      <p> Other things you can do at MapMates are: </p>
      <ul>
        <li> Add friends</li>
        <li> See other Stevens Students' Maps</li>
        <li> Earn badges based on reviews and number of friends </li>
      </ul>
    </>
  )

}


export default Home;
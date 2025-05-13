import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

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
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (!data.loggedIn) {
          alert("You need to be logged in to access this page");
          setLoggedIn(false);
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    isLoggedIn();
  }, [navigate]);

  return (
    <div className="home-container">
      <h1 className="home-title">🌍 Welcome To MapMates</h1>

      <p className="description">
        At MapMates, you can explore an interactive map of Hoboken’s restaurants. Click pins to copy addresses, add your own favorites, leave reviews, and connect with the Stevens community!
      </p>

      <p className="subtitle">Here’s what you can do at MapMates:</p>
      <ul className="feature-list">
        <li>🤝 Add friends</li>
        <li>🏅 Earn badges when you make 5 Reviews and 10 Friends</li>
        <li>💬 View your friends' restaurant reviews</li>
        <li>📍 Discover new spots in Hoboken!</li>
      </ul>

      <div className="usage-guide">
        <h3>🚀 How to Use MapMates:</h3>
        <ul>
          <li>🗺️ Click on the Map page to explore restaurants</li>
          <li>📌 Use pins to view restaurant info</li>
          <li>📝 Leave a review directly from a pin</li>
          <li>📢 Visit the Feed page to see reviews, likes, and comments</li>
          <li>➕ Add friends from the User Feed page</li>
          <li>🔁 Post on the map and watch your feed update!</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

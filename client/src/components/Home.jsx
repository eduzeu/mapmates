import React from "react";

function Home() {

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
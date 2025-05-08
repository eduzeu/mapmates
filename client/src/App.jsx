import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './components/Map'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Login from './components/Login'
import Logout from './components/Logout'
import UserFeed from './components/UserFeed'
import CreateAccount from './components/CreateAccount'
import SimpleLocationDetail from './components/SimpleLocationDetail'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maps" element={<Map />} />
            <Route path="/feed" element={<UserFeed />} />
            <Route path="/location/:locationName" element={<SimpleLocationDetail />} /> 
            <Route path="/signout" element={<Logout />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<CreateAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
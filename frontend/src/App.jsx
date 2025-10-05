import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Screen from "./components/Screen"
import Home from "./components/Home"
import Room from "./components/Room"
import CreateRoom from "./components/CreateRoom"
import Options from "./components/Options"
import { GameProvider } from "./context/GameContext"
function App() {
  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/room/create" element={<CreateRoom />}></Route>
          <Route path="/lobby/create" element={<Options />}></Route>
          <Route path="/room" element={<Room />}></Route>
          <Route path="/" element={<Home />}></Route>
          <Route path="/room/:id" element={<Screen />}></Route>
        </Routes>
      </GameProvider>
    </Router>
  )
}

export default App
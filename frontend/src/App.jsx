import Screen from "./components/Screen"
import { GameProvider } from "./context/GameContext"
function App() {
  return (
    <GameProvider>
      <Screen/>
    </GameProvider>
  )
}

export default App
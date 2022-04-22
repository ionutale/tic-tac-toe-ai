import Game from "./pages/game";
import './App.css'

function App() {
  return (
    <div className="App">
      <h1 className="animate__animated animate__bounceInDown">
        AI Trainable Tic Tac Toe
      </h1>

      <Game></Game>
    </div>
  );
}

export default App;

import {useState} from 'react'
import Board from '../components/Board'

const Game = () => {
  const [mainState, setMainState] = useState({
    games: [],
    history: [{
      squares: Array(9).fill(null),
    }],
    stepNumber: 0,
    xIsNext: true,
    activeModel: '' ,
  });


  const handleClick = (i) => {
    const history = mainState.history.slice(0, mainState.stepNumber + 1);
    const current = history.at(-1)
    const squares = [...current.squares]
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = mainState.xIsNext ? 'X' : 'O';
    setMainState({
      ...mainState,
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !mainState.xIsNext,
    });
  };


const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: i };
    }
  }
  return { winner: null, line: null };
}


  const jumpTo = (step) => {
    setMainState({
      ...mainState,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  };


  return <div>
    <Board 
      squares={mainState.history.at(-1).squares} 
      onClick={handleClick}/>
  </div>
}

export default Game;
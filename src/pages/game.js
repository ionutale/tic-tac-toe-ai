import { useState } from 'react'
import Board from '../components/Board'
import WinnerBar from '../components/WinnerBar';
import About from '../components/About';
import { trainOnGames, doPredict, getModel, getMoves } from '../tf/train';

const boardSize = [10, 10];
const sqaresNr = boardSize[0] * boardSize[1];

const emptyAllSqares = Array(sqaresNr).fill(null);
const Game = () => {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [mainState, setMainState] = useState({
    games: [],
    history: [{
      squares: emptyAllSqares,
    }],
    stepNumber: 0,
    xIsNext: true,
    activeModel: getModel(),
  });

  const handleClick = (i) => {
    console.log(i);
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

  const makeAIMove = async (state) => {
    const history = state.history.slice(0, state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    const AIready = squares.map((v) => {
      if (v === "X") {
        return state.xIsNext ? 1 : -1;
      } else if (v === "O") {
        return state.xIsNext ? -1 : 1;
      } else {
        return 0;
      }
    });

    let [move, moves] = await doPredict(AIready, state.activeModel);
    // Check if AI made a valid move!
    while (squares[move] !== null && squares.includes(null)) {
      console.log(`AI Failed - Spot ${move} - Resorting to next highest`);
      // Make current move 0
      moves[move] = 0;
      move = moves.indexOf(Math.max(...moves));
      // move = Math.floor(Math.random() * 9);
    }

    handleClick(move);
  }


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
    const progress = step === 0 ? [{ squares: emptyAllSqares }] : mainState.history;
    setMainState({
      ...mainState,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      history: progress,
    });
  };

  const trainUp = async (playerLearn) => {
    playerLearn = playerLearn || "O";
    console.log("Train Called - to be more like ", playerLearn);

    const AllMoves = mainState.history.map((board) => {
      return board.squares.map((v) => {
        if (v === playerLearn) {
          return 1;
        } else if (v === null) {
          return 0;
        } else {
          return -1;
        }
      });
    });

    const games = mainState.games.slice();
    games.push(getMoves(AllMoves));

    const newModel = await trainOnGames(games, setTrainingProgress);
    window.location.hash = "#";

    setMainState({
      ...mainState,
      games: games,
      activeModel: newModel,
      stepNumber: 0,
      xIsNext: true,
      history: [{
        squares: emptyAllSqares,
      }],
    });
  }

  const history = mainState.history;
  const current = history[mainState.stepNumber];
  const { winner, line } = calculateWinner(current.squares);

  const moves = history.map((step, move) => {
    const desc = move ? "Move #" + move : "Empty Board";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} className="btn effect01">
          <span>{desc}</span>
        </button>
      </li>
    );
  });

  let winnerIs;
  if (winner) {
    winnerIs = "Winner: " + winner;
  } else {
    winnerIs = "";
  }

  const trainSection = () => {
    if (winner || !current.squares.includes(null))
      return ['x', 'o'].map((player) => {
        return (<>
          <button
            href="#training-modal"
            onClick={() => trainUp(player)}
            className="btn effect01 animate__animated animate__fadeIn bigx"
          >
            <span>Train AI to play like {player}</span>
          </button>
          <br />
          <br />
        </>
        );
      });
  };

  return <>
    <div id="training-modal" className="modal">
      <div className="modal__content">
        <h1>
          Training in progress
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </h1>
        <progress id="training" max="100" value={trainingProgress}> {trainingProgress}% </progress>
      </div>
    </div>
    <div className='game'>
      <div className="game-board">
        <WinnerBar line={line} />
        <Board
          boardSize={boardSize}
          winnerSqares={[1,2,3,4,5]}
          squares={current.squares}
          onClick={handleClick} />
      </div>
      <div className="game-info">
        <h3>
          AI has learned from <strong>{mainState.games.length}</strong>{" "}
          game(s)
        </h3>
        <div>
          {winnerIs}
          {!winner && (
            <button
              onClick={makeAIMove.bind(this, mainState)}
              className="btn effect01"
              target="_blank"
            >
              <span>Make AI Move</span>
            </button>
          )}
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
    <div className="trainSection">
      {trainSection()}
    </div>
    <About activeModel={mainState.activeModel} games={mainState.games}/> 
  </>
}

export default Game;
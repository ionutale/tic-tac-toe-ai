import { useState } from 'react'
import Board from '../components/Board'
import WinnerBar from '../components/WinnerBar';
import { trainOnGames, doPredict, getModel, getMoves } from '../tf/train';

const Game = () => {
  const [mainState, setMainState] = useState({
    games: [],
    history: [{
      squares: Array(9).fill(null),
    }],
    stepNumber: 0,
    xIsNext: true,
    activeModel: getModel(),
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
    const progress =
      step === 0 ? [{ squares: Array(9).fill(null) }] : mainState.history;
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

    const newModel = await trainOnGames(games)
    window.location.hash = "#";

    setMainState({
      ...mainState,
      games: games,
      activeModel: newModel,
      stepNumber: 0,
      xIsNext: true,
      history: [{
        squares: Array(9).fill(null),
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
        <a onClick={() => jumpTo(move)} className="btn effect01">
          <span>{desc}</span>
        </a>
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
          <a
            href="#training-modal"
            onClick={() => trainUp(player)}
            className="btn effect01 animate__animated animate__fadeIn bigx"
          >
            <span>Train AI to play like {player}</span>
          </a>
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
          Training
          <div class="spinner">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
          </div>
        </h1>
      </div>
    </div>
    <div className='game'>
      <div className="game-board">
        <WinnerBar line={line} />
        <Board
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
            <a
              onClick={makeAIMove.bind(this, mainState)}
              className="btn effect01"
              target="_blank"
            >
              <span>Make AI Move</span>
            </a>
          )}
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
    <div className="trainSection">
      {trainSection()}
    </div>
  </>
}

export default Game;
import { useState } from 'react'
import Board from '../components/Board'
import WinnerBar from '../components/WinnerBar';
import About from '../components/About';
import { trainOnGames, doPredict, getModel, getMoves } from '../tf/train';

const boardSize = [10, 10];
const sqaresNr = boardSize[0] * boardSize[1];
const winSequece = 5;

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
    winnerSqares: [],
  });

  const handleClick = (i) => {
    console.log(i);
    const history = mainState.history.slice(0, mainState.stepNumber + 1);
    const current = history.at(-1)
    const squares = [...current.squares]

    // check if square is already filled
    // or if winner is already declared
    if (squares[i] || mainState.winnerSqares.length) {
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
      winnerSqares: checkHorizontalWin(squares, i) || checkVerticalWin(squares, i) /*|| checkDiagonalWin(squares, i)*/ || [],
    });
  };

  const handleMouseOver = (indx) => {
    // number of sqares to check
    const nrToCheck = 3;

    // from the position of i, 
    // select sqares from -2 to 2 in both directions
    // and return them to winnwerSqares
    const offSetMin = 1
    const offSetMax = offSetMin * 2 + 1

    const firstSqareIndx = indx - boardSize[1] * (offSetMin * 1.1)
    const lastSqareIndx = indx + boardSize[1] * (offSetMin * 1.1)

    const sqares = [firstSqareIndx, lastSqareIndx]

    // loop
    for (let j = 0; j < 3; j++) {
      for (let i = firstSqareIndx + (boardSize[0] * j); i < (firstSqareIndx + offSetMax + (boardSize[0] * j)); i++) {
        sqares.push(i)
      }
    }

    setMainState({
      ...mainState,
      winnerSqares: sqares,
    });

  }

  /*
     use the mouse click button to get the center of the square of 9 squares

  */
  const handleMouseDown = (indx) => {
    // number of sqares to check
    const nrToCheck = 3;

    // from the position of i,
    // select sqares from -2 to 2 in both directions
    // and return them to winnwerSqares
    const offSetMin = 1
    const offSetMax = offSetMin * 2 + 1

    const firstSqareIndx = indx - boardSize[1] * (offSetMin * 1.1)
    const lastSqareIndx = indx + boardSize[1] * (offSetMin * 1.1)

    const sqares = [firstSqareIndx, lastSqareIndx]

    // loop
    for (let j = 0; j < 3; j++) {
      for (let i = firstSqareIndx + (boardSize[0] * j); i < (firstSqareIndx + offSetMax + (boardSize[0] * j)); i++) {
        sqares.push(i)
      }
    }

    setMainState({
      ...mainState,
      winnerSqares: sqares,
    });
  }


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

  const checkVerticalWin = (squares, i) => {
    // use the i to find the current player
    const player = squares[i];

    // get column from i
    const column = Math.floor(i % boardSize[0]);

    let win = [];
    // if the i is equal to 1, then check sqares 11, 21, 31, 41, 51 for the same player
    for (let j = 1; j <= boardSize[0]; j++) {
      if (squares[column + j * boardSize[0]] === player) {
        win.push(column + j * boardSize[0]);
        if (win.length === winSequece) {
          return win;
        }
      } else {
        win = [];
      }
    }
    return undefined;
  }

  const checkHorizontalWin = (squares, i) => {
    // use the i to find the current player
    const player = squares[i];

    // use the i to find the row
    const row = Math.floor(i / boardSize[0]);
    // use the row to find the start and end of the row
    const start = row * boardSize[0];
    const end = start + boardSize[0];
    // use the start and end to find the win sequence
    const rowToCheck = squares.slice(start, end);

    let winArr = [];

    // loop through the row and check if there are winSequece in a row with the same player
    for (let i = 0; i < rowToCheck.length; i++) {
      if (rowToCheck[i] === player) {
        winArr.push(i + start);
        if (winArr.length === winSequece) {
          return winArr;
        }
      } else {
        winArr = [];
      }
    }
    return undefined;
  }

  const checkDiagonalWin = (squares, i) => {
    // use the i to find the current player
    const player = squares[i];

    // use the i to find the row
    const row = Math.floor(i / boardSize[0]);

    // use the row to find the start and end of the row
    const start = row * boardSize[0];
    const end = start + boardSize[0];

    // use the i to find the column
    const column = Math.floor(i % boardSize[0]);

    // use the column to find the start and end of the column
    const columnStart = column;
    const columnEnd = column + boardSize[0];

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
      winnerSqares: [],
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
        <Board
          boardSize={boardSize}
          winnerSqares={mainState.winnerSqares}
          squares={current.squares}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
        />
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
    <About activeModel={mainState.activeModel} games={mainState.games} />
  </>
}
export default Game;
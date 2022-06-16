import { useState, useEffect, useRef } from 'react'
import Board from '../components/Board'
import About from '../components/About';
import { trainOnGames, doPredict, getModel, getMoves } from '../tf/train';
import * as checkWin from '../util/check-win';
import * as dbApi from '../util/db-api'

const boardSize = [10, 10];
const sqaresNr = boardSize[0] * boardSize[1];
const emptyAllSqares = Array(sqaresNr).fill(null);

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Game = () => {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [mainState, setMainState] = useState({
    games: localStorage.getItem('games') ? JSON.parse(localStorage.getItem('games')) : [],
    history: [{ squares: emptyAllSqares }],
    stepNumber: 0,
    xIsNext: true,
    activeModel: getModel(),
    winnerSqares: [],
    score: {
      X: 0,
      O: 0
    }
  });

  /* autoplay */

  // create a function what will return promise after a delay

  // create a function that will call 'makeAIMove' after a delay 
  // and in case of winnerSqares is not empty, it will save the game to mainState.games
  useInterval(() => {
    // Your custom logic here
    aiMove();
  }, 100);

  const autoplay = async () => {
    dbApi.saveData({ "name": "ion", "arr": [1, 2, 3, 4, 5] })
  }

  function aiMove() {
    if (mainState.winnerSqares.length === 0) {
      makeAIMove(mainState);
    } else {
      const winner = !mainState.xIsNext ? "X" : "O"
      saveGame(winner);
    }
  }


  /* autoplay */

  const handleClick = (i) => {
    const squares = [...mainState.history.at(-1).squares];

    // check if square is already filled
    // or if winner is already declared
    if (squares[i] || mainState.winnerSqares.length) {
      return;
    }
    squares[i] = mainState.xIsNext ? 'X' : 'O';

    setMainState({
      ...mainState,
      history: [...mainState.history, { squares: squares }],
      stepNumber: mainState.history.length,
      xIsNext: !mainState.xIsNext,
      winnerSqares:
        checkWin.checkHorizontalWin(squares, i, boardSize) ||
        checkWin.checkVerticalWin(squares, i, boardSize) ||
        checkWin.checkDiagonalWin(squares, i, boardSize) ||
        checkWin.checkReverseDiagonalWin(squares, i, boardSize) ||
        [],
    });
  };

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

  const makeAIMove = async (state) => {
    const squares = [...state.history.at(-1).squares];

    const AIready = squares.map((v) => {
      if (v === "X") {
        return state.xIsNext ? 1 : -1;
      } else if (v === "O") {
        return state.xIsNext ? -1 : 1;
      } else {
        return 0;
      }
    });

    let nextSqare = Array.from(await doPredict(AIready, state.activeModel));
    // from the nextSqare get the highest value index
    let emptySquaresOnly = nextSqare.filter((v, i) => squares[i] === null)

    let highestValueIndex = emptySquaresOnly.indexOf(Math.max(...emptySquaresOnly));
    // check if all board has been filled and there is no winner, reset the game
    if (highestValueIndex === -1) {
      jumpTo(0);
      return;
    }


    // check if square is already filled
    // or if winner is already declared
    if (highestValueIndex < 0 || squares[highestValueIndex] || state.winnerSqares.length) {
      const emptySquares = squares.map((v, i) => {
        if (v === null) {
          return i;
        }
        return undefined;
      }).filter((v) => v !== undefined);
      const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      console.log("random square is:", randomSquare, highestValueIndex);
      highestValueIndex = randomSquare;
    }

    handleClick(highestValueIndex);
  }

  // random move
  const randomMove = async (state) => {
    const squares = [...state.history.at(-1).squares];

    // return random square from the empty squares
    const emptySquares = squares.map((v, i) => {
      if (v === null) {
        return i;
      }
      return undefined;
    }).filter((v) => v !== undefined);
    const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    console.log("random square is:", randomSquare);

    handleClick(randomSquare);
  }

  const saveGame = async (playerLearn) => {
    playerLearn = playerLearn || "O";
    console.log("Train Called - to be more like ", playerLearn);

    const AllMoves = mainState.history.map((board) => {
      return board.squares.map((v) => {
        if (v === null) return 0;
        return v === playerLearn ? 1 : -1;
      });
    });


    let games = [...mainState.games, getMoves(AllMoves)];

    console.log("saving to local storage");
    //localStorage.setItem('games', JSON.stringify(games));
    //saveToDb(games.at(-1))
    dbApi.saveData(games.at(-1))

    if (games.length > 10) {
      games = [games.at(-1)]
    }

    console.log(`${playerLearn} won! ${mainState.score[playerLearn]}`);

    setMainState({
      ...mainState,
      games: games,
      stepNumber: 0,
      xIsNext: true,
      history: [{
        squares: emptyAllSqares,
      }],
      winnerSqares: [],
      score: {
        ...mainState.score,
        [playerLearn]: mainState.score[playerLearn] + 1
      }
    });
    setTrainingProgress(0);
  }

  const trainModel = async () => {
    const newModel = await trainOnGames(mainState.games, setTrainingProgress);
    console.log("new model is ready");

    console.log("saving to local state");
    setMainState({
      ...mainState,
      activeModel: newModel
    });
    setTrainingProgress(0);
  }

  const moves = mainState.history.map((step, move) => {
    const desc = move ? `Move #  ${move}` : "Empty Board";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} className="btn effect01">
          <span>{desc}</span>
        </button>
      </li>
    );
  });

  const saveWinGame = () => {
    return ['x', 'o'].map((player, idx) => {
      return (<>
        <button
          key={idx}
          onClick={() => saveGame(player)}
          className="btn effect01 animate__animated animate__fadeIn bigx"
        >
          <span>Save Game like {player}</span>
        </button>
      </>
      );
    });
  };

  const winner = (state) => state.winnerSqares.length ? `Winner is: ${!state.xIsNext ? "X" : "O"}` : `Next player: ${state.xIsNext ? "X" : "O"}`;

  return <>
    <div id="training-modal" className={trainingProgress > 0 ? "modal modal-visible" : "modal"}>
      <div className="modal__content">
        <h1>
          Training in progress
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </h1>
        <p>{trainingProgress}</p>
        <progress id="training" max="100" value={trainingProgress}> {trainingProgress}% </progress>
      </div>
    </div>
    <button onClick={() => autoplay()} className="btn effect01 animate__animated animate__fadeIn bigx">auto play</button>
    <button onClick={() => trainModel()} className="btn effect01 animate__animated animate__fadeIn">train model </button>
    {saveWinGame()}

    <div className='game'>
      <div className="game-board">
        <Board
          boardSize={boardSize}
          winnerSqares={mainState.winnerSqares}
          squares={mainState.history.at(-1).squares}
          onClick={handleClick}
        />
      </div>
      <div className="game-info">
        <h3>
          AI has learned from <strong>{mainState.games.length}</strong>{" "}
          game(s)
        </h3>
        <h4>Score - X:{mainState.score.X} 0: {mainState.score.O}</h4>
        <div>
          {winner(mainState)}

          <button
            onClick={makeAIMove.bind(this, mainState)}
            id="ai-move"
            className="btn effect01"
            target="_blank"
          >
            <span>Make AI Move</span>
          </button>

        </div>
        <ol className="moves-list"
        >{moves}</ol>
      </div>
    </div>

    <About activeModel={mainState.activeModel} games={mainState.games} />
  </>
}
export default Game;
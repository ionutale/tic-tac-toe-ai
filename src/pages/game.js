import { useState } from 'react'
import Board from '../components/Board'
import About from '../components/About';
import { trainOnGames, doPredict, getModel, getMoves } from '../tf/train';
import * as checkWin from '../util/check-win';

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
    winnerSqares: [],
  });

  const handleClick = (i) => {
    console.log(i, mainState.xIsNext ? 'X' : 'O');
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

    let nextSqare = await doPredict(AIready, state.activeModel);
    console.log(nextSqare);

    // check if square is already filled
    // or if winner is already declared
    if (squares[nextSqare] || state.winnerSqares.length) {
      console.log('square is already filled');
      return;
    }
    // from the nextSqare get the highest value index
    const highestValueIndex = nextSqare.indexOf(Math.max(...nextSqare));
    console.log("next suggested square is:",highestValueIndex);
    //handleClick(nextSqare);
  }

  const trainUp = async (playerLearn) => {
    playerLearn = playerLearn || "O";
    console.log("Train Called - to be more like ", playerLearn);

    const AllMoves = mainState.history.map((board) => {
      return board.squares.map((v) => {
        if (v === null) return 0;
        return v === playerLearn ? 1 : -1;
      });
    });

    const games = [...mainState.games, getMoves(AllMoves)];

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
      winnerSqares: [],
    });
  }

  const history = mainState.history;
  const current = history[mainState.stepNumber];

  const moves = history.map((step, move) => {
    const desc = move ? `Move #  ${move}` : "Empty Board";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} className="btn effect01">
          <span>{desc}</span>
        </button>
      </li>
    );
  });

  const trainSection = () => {
    if (!mainState.winnerSqares.includes(null))
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

  const winner = (state) => state.winnerSqares.length ? `Winner is: ${!state.xIsNext ? "X" : "O"}` :  `Next player: ${state.xIsNext ? "X" : "O"}`;

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
        />
      </div>
      <div className="game-info">
        <h3>
          AI has learned from <strong>{mainState.games.length}</strong>{" "}
          game(s)
        </h3>
        <div>
          {winner(mainState)}
          
            <button
              onClick={makeAIMove.bind(this, mainState)}
              className="btn effect01"
              target="_blank"
            >
              <span>Make AI Move</span>
            </button>
          
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
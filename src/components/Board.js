import Square from "./Sqare";

const Board = (props) => {

  const { squares, onClick, winnerSqares, boardSize } = props;
  // console.log(winnerSqares);

  const renderSquare = (i) => {
    const squareVal = squares[i];
    let glowClass = winnerSqares?.includes(i) ? "glow" : "";
    return (
      <Square key={i}
        glow={glowClass}
        value={squareVal}
        onClick={() => onClick(i)}
      />
    );
  }

  const renderRow = (row) => {
    const rowSquares = [];
    for (let i = 0; i < boardSize[1]; i++) {
      rowSquares.push(renderSquare(row * boardSize[1] + i));
    }
    return (
      <div key={`row-${row}`} className="board-row">
        {rowSquares}
      </div>
    );
  }

  const renderBoard = () => {
    const boardRows = [];
    for (let i = 0; i < boardSize[0]; i++) {
      boardRows.push(renderRow(i));
    }
    return (
      <div>
        {boardRows}
      </div>
    );
  }



  return ( <>
    { renderBoard() }
  </>
  );
}

export default Board;

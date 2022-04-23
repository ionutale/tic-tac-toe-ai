import Square from "./Sqare";

const boardSize = [10, 10];
const Board = (props) => {
  const { squares, onClick } = props;
  const renderSquare = (i) => {
    const squareVal = squares[i];
    return (
      <Square
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
      <div className="board-row">
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

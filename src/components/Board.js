import Square from "./Sqare";

const Board = (props) => {
  const { squares, onClick } = props;

  const renderSquare = (i) => {    
    const squareVal = squares[i];
    
    let glowClass;
    if (squareVal === "X") {
      glowClass = "red";
    } else if (squareVal) {
      glowClass = "blue";
    }
    return (
      <Square
        glow={glowClass}
        value={squareVal}
        onClick={() => onClick(i)}
      />
    );
  }

  return (
    <div className="">
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}

export default Board;

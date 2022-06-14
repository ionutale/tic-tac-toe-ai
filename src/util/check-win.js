const winSequece = 5;

export const checkVerticalWin = (squares, i, boardSize) => {
  // use the i to find the current player
  const player = squares[i];

  // get column from i
  const column = Math.floor(i % boardSize[0]);

  let win = [];
  // if the i is equal to 1, then check sqares 11, 21, 31, 41, 51 for the same player
  for (let j = 0; j <= boardSize[0]; j++) {
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


export const checkHorizontalWin = (squares, i, boardSize) => {
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

export const checkDiagonalWin = (squares, i, boardSize) => {
  // now we need to check if the win is in diagonal
  // the i is the current square
  // use the i to loop through the diagonal
  // and check if the sqare value is the same
  // if it is, then push it to the win array
  // if the win array is equal to winSequece, then return the win array
  // if not, then return undefined
  let player = squares[i];
  let win = [];
  let j = i;
  while (j >= 0 && j < boardSize[0] * boardSize[1]) {
    if (squares[j] === player) {
      win.push(j);
      if (win.length === winSequece) {
        return win;
      }
    } else {
      win = [];
    }
    j -= boardSize[0] + 1;
  }

  j = i;
  while (j >= 0 && j < boardSize[0] * boardSize[1]) {
    if (squares[j] === player) {
      win.push(j);
      if (win.length === winSequece) {
        return win;
      }
    } else {
      win = [];
    }
    j += boardSize[0] + 1;
  }
  return undefined;
}

export const checkReverseDiagonalWin = (squares, i, boardSize) => {
  // now we need to check if the win is in reverse diagonal
  // the i is the current square
  // use the i to loop through the reverse diagonal
  // and check if the sqare value is the same
  // if it is, then push it to the win array
  // if the win array is equal to winSequece, then return the win array
  // if not, then return undefined
  let player = squares[i];
  let win = [];
  let j = i;
  while (j >= 0 && j < boardSize[0] * boardSize[1]) {
    if (squares[j] === player) {
      win.push(j);
      if (win.length === winSequece) {
        return win;
      }
    } else {
      win = [];
    }
    j += boardSize[0] - 1;
  }

  j = i;
  while (j >= 0 && j < boardSize[0] * boardSize[1]) {
    if (squares[j] === player) {
      win.push(j);
      if (win.length === winSequece) {
        return win;
      }
    } else {
      win = [];
    }
    j -= boardSize[0] - 1;
  }
  return undefined;
}
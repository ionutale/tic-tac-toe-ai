const WinnerBar = ({line}) => {
  if (line === null) return;
  const pad = 20;
  const cellSize = 65;

  const lines = [
    {
      // top across
      x1: `${0 + pad}`,
      y1: `${cellSize / 2 + pad}`,
      x2: `${300 - pad}`,
      y2: `${cellSize / 2 + pad}`,
    },
    {
      // mid across
      x1: `${0 + pad}`,
      y1: `${cellSize * 2 + pad}`,
      x2: `${300 - pad}`,
      y2: `${cellSize * 2 + pad}`,
    },
    {
      // bottom across
      x1: `${0 + pad}`,
      y1: `${cellSize * 4 - 10}`,
      x2: `${300 - pad}`,
      y2: `${cellSize * 4 + -10}`,
    },
    {
      // left down
      x1: `${cellSize / 2 + pad}`,
      y1: `${0 + pad}`,
      x2: `${cellSize / 2 + pad}`,
      y2: `${300 - pad}`,
    },
    {
      // middle down
      x1: `${cellSize * 2 + pad}`,
      y1: `${0 + pad}`,
      x2: `${cellSize * 2 + pad}`,
      y2: `${300 - pad}`,
    },
    {
      // right down
      x1: `${cellSize * 4 - 10}`,
      y1: `${0 + pad}`,
      x2: `${cellSize * 4 - 10}`,
      y2: `${300 - pad}`,
    },
    {
      // top left to bottom right
      x1: `${0 + pad}`,
      y1: `${0 + pad}`,
      x2: `${300 - pad}`,
      y2: `${300 - pad}`,
    },

    {
      // bottom left to top right
      x1: `${0 + pad}`,
      y1: `${cellSize * 4 + pad}`,
      x2: `${cellSize * 4 + pad}`,
      y2: `${0 + pad}`,
    },
  ];
  console.log('line: ', line, lines[line]);
  return (
    <svg
      className="winLine animate_animated animate__bounceIn animate__slower"
      width="300"
      height="300"
    >
      <line
        {...lines[line]}
        strokeLinecap="round"
        stroke="#fffd"
        strokeWidth="5"
      ></line>
    </svg>
  );
};

export default WinnerBar;
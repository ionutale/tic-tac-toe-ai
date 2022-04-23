
export const About = (props) => {
  return (
    <div id="about" className="modal">
      <div className="modal__content">
        <h1>About</h1>
        <div>
          <p className="basic_about">
            This is an exploratory project that uses a regular neural network
            to teach AI how to play Tic Tac Toe. The most common method of
            solving Tic Tac Toe is normally using Q-Learning, but what fun is
            that?
          </p>
          <p>
            By playing an effective 6 or 7 games you can make a pretty
            unbeatable AI!
          </p>
        </div>
        <div>
          <a
            onClick={() =>
              this.state.activeModel.save("downloads://ttt_model")
            }
            className="btn effect01"
          >
            <span>Download Current AI Model</span>
          </a>
          <br />
          <a
            onClick={() => {
              const blob = new Blob(
                [
                  `
{
"createdWith": "https://tic-tac-toe-ai-five.vercel.app/",
"creationDate": "${new Date().toISOString().split("T")[0]}",
"games": ${JSON.stringify(this.state.games, null, 2)}
}`,
                ],
                {
                  type: "application/json;charset=utf-8",
                }
              );
              saveAs(blob, "tictactoe.json");
            }}
            className="btn effect01"
          >
            <span>Download Games Training Data</span>
          </a>
        </div>
        <br />
        <a href="#" className="modal__close">
          &times;
        </a>
      </div>
    </div>
  );
}

export default About;
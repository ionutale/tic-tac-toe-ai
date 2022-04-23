import { saveAs } from "file-saver";

const About = (props) => {
  return (
        <div>
        <div>
          <button
            onClick={() =>
              props.activeModel.save("downloads://ttt_model")
            }
            className="btn effect01"
          >
            <span>Download Current AI Model</span>
          </button>
          <br />
          <button
            onClick={() => {
              const blob = new Blob(
                [
                  `
{
"createdWith": "https://tic-tac-toe-ai-five.vercel.app/",
"creationDate": "${new Date().toISOString().split("T")[0]}",
"games": ${JSON.stringify(props.games, null, 2)}
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
          </button>
        </div>
        <br />
       { /* eslint-disable-next-line */ }
        <a href="#" className="modal__close">
          &times;
        </a>
      </div>
  );
}

export default About;
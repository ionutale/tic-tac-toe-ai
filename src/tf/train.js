import * as tf from "@tensorflow/tfjs";

// TODO: Dis so nasty
export const doPredict = async (myBoard, ttt_model) => {
  const tenseBlock = tf.tensor([myBoard]);
  const result = await ttt_model.predict(tenseBlock);

  const flatty = result.flatten();
  const maxy = flatty.argMax();
  const move = await maxy.data();
  const allMoves = await flatty.data();

  flatty.dispose();
  tenseBlock.dispose();
  result.dispose();
  maxy.dispose();
  return [move[0], allMoves];
};

let currentModel;
const flipX = (arr) => {
  return [arr.slice(6), arr.slice(3, 6), arr.slice(0, 3)].flat();
};

const flipY = (arr) => flipX(arr.slice().reverse());

// Creates a 1 hot of the diff
const showMove = (first, second) => {
  let result = [];
  first.forEach((move, i) => {
    result.push(Math.abs(move - second[i]));
  });
  return result;
};

export const getMoves = (block) => {
  let x = [];
  let y = [];
  // Make all the moves
  for (let i = 0; i < block.length - 1; i++) {
    const theMove = showMove(block[i], block[i + 1]);
    // Normal move
    x.push(block[i]);
    y.push(theMove);
    // Flipped X move
    x.push(flipX(block[i]));
    y.push(flipX(theMove));
    // Inverted Move
    x.push(block[i].slice().reverse());
    y.push(theMove.slice().reverse());
    // Flipped Y move
    x.push(flipY(block[i]));
    y.push(flipY(theMove));
  }
  return { x, y };
};

export const constructModel = () => {
  currentModel && currentModel.dispose();
  tf.disposeVariables();

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: 9,
      units: 64,
      activation: "relu"
    })
  );

  model.add(
    tf.layers.dense({
      units: 64,
      activation: "relu"
    })
  );

  model.add(
    tf.layers.dense({
      units: 9,
      activation: "softmax"
    })
  );

  const learningRate = 0.005;
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  currentModel = model;
  return model;
};

export const getModel = () => {
  if (currentModel) {
    return currentModel;
  } else {
    return constructModel();
  }
};

export const trainOnGames = async (games, trainingProgress) => {
  try {
    
    const model = constructModel();
    // model.dispose();
    let AllX = [];
    let AllY = [];
    
    // console.log("Games in", JSON.stringify(games), games);
    games.forEach((game) => {
      AllX = AllX.concat(game.x);
      AllY = AllY.concat(game.y);
    });
    
    // Tensorfy!
    // console.log("AllX", AllX);
    const stackedX = tf.stack(AllX);
    const stackedY = tf.stack(AllY);
    await trainModel(model, stackedX, stackedY, trainingProgress);
    
    // clean up!
    stackedX.dispose();
    stackedY.dispose();
    
    return model;
  } catch (error) {
    console.error(error);
    return getModel();
  }
};

const trainModel = async (model, stackedX, stackedY, trainingProgress) => {
  const allCallbacks = {
    // onTrainBegin: log => console.log(log),
    // onTrainEnd: log => console.log(log),
    // onEpochBegin: (epoch, log) => console.log(epoch, log),
    onEpochEnd: (epoch, log) => {
      trainingProgress(epoch);
    }
    // onBatchBegin: (batch, log) => console.log(batch, log),
    // onBatchEnd: (batch, log) => console.log(batch, log)
  };

  await model.fit(stackedX, stackedY, {
    epochs: 100,
    shuffle: true,
    batchSize: 32,
    callbacks: allCallbacks
  });

  console.log("Model Trained");

  return model;
};


export const saveData = async (data) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");

    var raw = JSON.stringify({
      "collection": "tictactoe-traindata",
      "database": "medium",
      "dataSource": "Cluster0",
      "document": data
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    let result = (await fetch("https://europe-west3-beta-dodolandia.cloudfunctions.net/SaveTrainData", requestOptions)).text()
    console.log(result)
  } catch (error) {
    console.log('error', error)
  }
}
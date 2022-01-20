import React, { useState, useEffect } from "react";
import "./App.css";

import axios from "axios";

function App() {
  const [points, setPoints] = useState({});
  const [payer, setPayer] = useState("DANNON");
  const [pointsToSpend, setPointsToSpend] = useState(0);
  let [totalPoints, setTotalPoints] = useState(0);

  const getPoints = () => {
    axios.get("http://localhost:5000/points/1").then((response) => {
      setPoints(response.data);
    });
  };

  const addPoints = (payer = "DANNON") => {
    axios
      .post("http://localhost:5000/points/1/add", {
        payer: payer,
        points: 300,
        timestamp: "2014-09-02T12:00:00Z",
      })
      .then((response) => {
        getPoints();
      })
      .catch((error) => {
        console.log("error");
      });
  };

  const spendPoints = (points = 0) => {
    axios
      .post("http://localhost:5000/points/1/subtract", {
        points: points,
      })
      .then((response) => {
        getPoints();
      })
      .catch((error) => {
        console.log("error");
      });
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    if (e.target.value === "Add 300 Points") {
      addPoints(payer);
    } else if (e.target.value === "Spend Points") {
      spendPoints(pointsToSpend);
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    setPayer(e.target.value);
  };

  const handleSpendChange = (e: any) => {
    e.preventDefault();
    setPointsToSpend(e.target.value);
  };

  useEffect(() => {
    getPoints();
  }, []);

  useEffect(() => {
    const tempPoints: any = Object.values(points).reduce(
      (a: any, b: any): any => {
        return a + b;
      },
      0
    );
    setTotalPoints(tempPoints);
  }, [points]);

  return (
    <div className="App">
      <h1>Payer Point Balance</h1>
      <p>Total Points: {totalPoints}</p>
      <div>
        <input defaultValue={"DANNON"} onChange={handleChange}></input>
        <input
          type="button"
          value="Add 300 Points"
          onClick={handleClick}
        ></input>
      </div>
      <div>
        <input defaultValue={0} onChange={handleSpendChange}></input>
        <input type="button" value="Spend Points" onClick={handleClick}></input>
      </div>
      <table style={{}}>
        <tbody>
          {Object.entries(points).map((key) => {
            return (
              <tr>
                <td>
                  {key[0]} : {key[1]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

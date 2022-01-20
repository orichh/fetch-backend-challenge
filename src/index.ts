import express, { Request, Response, Application } from "express";
import Joi from "joi";
import helmet from "helmet";

// initialize server
const port = process.env.PORT || 5000;
const app: Application = express();

// express middleware
app.use(express.json()); // parse JSON payloads
app.use(helmet()); // set security-related HTTP response headers

// initialize temporary data storage, array of objects for sorting
// prettier-ignore
interface Transaction {
  payer: string;
  points: number;
  timestamp: number
}
let userTransactions: Array<Transaction> = [];
let payerBalances: { [key: string]: number } = {};
let userTotalPoints = 0;

// root, sends back available endpoints
app.get("/", (req: Request, res: Response) => {
  console.log("hit");
  const endpoints: { GET: Array<string>; POST: Array<string> } = {
    GET: ["/points/:user_id"],
    POST: ["/points/:user_id/add", "/points/:user_id/subtract"],
  };
  res.send(endpoints);
});

// get all points for a user
app.get("/points/:user_id", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

// add points: request body validation schema
// prettier-ignore
const addPointsSchema = Joi.object({
  payer: Joi.string().pattern(/^[A-Z]+$/, "capital letters").required(), // check payer and for A-Z chars
  points: Joi.number().integer().required(), // check points and if integer
  timestamp: Joi.string().isoDate().required(), // check timestamp is isoDate
});

// add points to a user's balance
// prettier-ignore
app.post("/points/:user_id/add", (req: Request, res: Response) => {
  const { error, value } = addPointsSchema.validate(req.body);

  if (error === undefined) { // add transaction to userTransactions if valid request
    let { payer, points, timestamp } = value;

    // convert to isoDate to milliseconds for sort comparison
    timestamp = +new Date(timestamp);

    /*
      NOTE: Would use database's native sorting methods for faster sorting in production
      For small-scale testing, JS's native sort method works for now
     */

    // add transaction to userTransactions then sort by timestamp from most recent (left) to oldest (right)
    userTransactions.push({ payer, points, timestamp });
    userTransactions.sort((a, b) => b.timestamp - a.timestamp);

    // Add payer and points to payerBalances, add points if already exists
    payerBalances[payer] = payerBalances[payer] + points || points;

    // Add to user's total points
    userTotalPoints += points;

    console.log('total points', userTotalPoints)
    console.log('payer balances', payerBalances)
    console.log('user transactions', userTransactions)
    res.sendStatus(201);
  } else { // send error code if invalid request
    res.sendStatus(400);
  }
});

// subtract (spend) points: request body validation schema
const subtractPointsSchema = Joi.object({
  points: Joi.number().integer().required(), // check points and if integer
});

// subtract (spend) points from a user's balance
app.post("/points/:user_id/subtract", (req: Request, res: Response) => {
  const { error, value } = subtractPointsSchema.validate(req.body);
  if (error === undefined && value.points <= userTotalPoints) {
    let pointsToSpend = value.points;

    // TODO: carve this out into its own function outside of the post request
    while (pointsToSpend > 0) {
      const latestTransaction = userTransactions[userTransactions.length - 1];
      if (pointsToSpend >= latestTransaction.points) {
        // remove latest transaction from userTransactions
        // decrement from payerBalances
        payerBalances[latestTransaction.payer] -= latestTransaction.points;
        userTransactions.pop();
        userTotalPoints -= pointsToSpend;
        pointsToSpend -= latestTransaction.points;
      } else {
        // reduce points from payer balance of latest transaction
        payerBalances[latestTransaction.payer] -= latestTransaction.points;
        // reduce points from latest transaction
        userTransactions[userTransactions.length - 1].points -= pointsToSpend;
        userTotalPoints -= pointsToSpend;
        pointsToSpend = 0;
      }
    }

    console.log("total points", userTotalPoints);
    console.log("payer balances", payerBalances);
    console.log("user transactions", userTransactions);
    console.log("value", value.points);
    res.send(payerBalances);
  } else {
    res.sendStatus(400);
  }
});

const server = app.listen(port, () => {
  console.log("App listening at http://localhost:5000");
});

module.exports = server;

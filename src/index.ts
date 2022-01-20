import express, { Request, Response, Application } from "express";
import Joi from "joi";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import redis from "redis";

// initialize server
const port = process.env.PORT || 5000;
const app: Application = express();

// express middleware
app.use(express.json()); // parse JSON payloads
app.use(helmet()); // set security-related HTTP response headers
const expressRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(expressRateLimiter); // limits amount of requests to the server

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

////////////////////
/////
/////
///// HELPER FUNCTIONS FOR ENDPOINTS
/////
/////
////////////////////

// TODO: Extract functions into separate file to de-clutter

// add points: request body validation schema
// prettier-ignore
const addPointsSchema = Joi.object({
  payer: Joi.string().pattern(/^[A-Z]+$/, "capital letters").required(), // check payer and for A-Z chars
  points: Joi.number().integer().required(), // check points and if integer
  timestamp: Joi.string().isoDate().required(), // check timestamp is isoDate
});

// add points: void function to add points.
const addPoints = ({ payer, points, timestamp }: Transaction): void => {
  // convert to isoDate to milliseconds for sort comparison
  timestamp = +new Date(timestamp);

  /*
    TODO: Would use database's native sorting methods for faster sorting in production
    For small-scale testing, JS's native sort method works for now
  */

  // add transaction to userTransactions then sort by timestamp from most recent (left) to oldest (right)
  userTransactions.push({ payer, points, timestamp });
  userTransactions.sort((a, b) => b.timestamp - a.timestamp);

  // Add payer and points to payerBalances, add points if already exists
  if (payerBalances[payer]) {
    payerBalances[payer] += points;
  } else {
    payerBalances[payer] = points;
  }

  // Add to user's total points
  userTotalPoints += points;
};

// subtract (spend) points: request body validation schema
const subtractPointsSchema = Joi.object({
  points: Joi.number().integer().required(), // check points and if integer
});

// subtract (spend) points: void function to spend points
const subtractPoints = (pointsToSpend: number): void => {
  while (pointsToSpend > 0) {
    const latestTransaction = userTransactions[userTransactions.length - 1];
    if (pointsToSpend >= latestTransaction.points) {
      // if spend amount is greater than or equal to latest transaction
      // decrement from payerBalances
      payerBalances[latestTransaction.payer] -= latestTransaction.points;

      // remove latest transaction from userTransactions
      userTransactions.pop();

      // reduce user's total points
      userTotalPoints -= pointsToSpend;

      // reduce pointsToSpend by the latest transaction's points
      pointsToSpend -= latestTransaction.points;
    } else {
      // if latest transaction is greater than spend amount
      // reduce points from payer balance of latest transaction
      payerBalances[latestTransaction.payer] -= pointsToSpend;

      // reduce points from latest transaction
      userTransactions[userTransactions.length - 1].points -= pointsToSpend;

      // reduce user's total points
      userTotalPoints -= pointsToSpend;

      // set pointsToSpend to zero if latest transaction was enough to cover
      pointsToSpend = 0;
    }
  }
};

// subtract (spend) points: Return changes in balances
const getBalanceDifferences = (
  payerBalanceChanges: { [key: string]: number },
  payerBalances: { [key: string]: number }
) => {
  for (const [payer, points] of Object.entries(payerBalances)) {
    if (payerBalanceChanges[payer] === points) {
      delete payerBalanceChanges[payer];
    } else {
      payerBalanceChanges[payer] = points - payerBalanceChanges[payer];
    }
  }

  return payerBalanceChanges;
};

////////////////////
/////
/////
///// ENDPOINTS
/////
/////
////////////////////

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
  res.send(payerBalances);
});

// add points to a user's balance
// prettier-ignore
app.post("/points/:user_id/add", (req: Request, res: Response) => {
  const { error, value } = addPointsSchema.validate(req.body);

  if (error === undefined) { // add transaction to userTransactions if valid request
    addPoints(value)
    res.sendStatus(201);
  } else { // send error code if invalid request
    res.sendStatus(400);
  }
});

// subtract (spend) points from a user's balance
app.post("/points/:user_id/subtract", (req: Request, res: Response) => {
  const { error, value } = subtractPointsSchema.validate(req.body);

  if (error === undefined && value.points <= userTotalPoints) {
    const payerBalanceChanges = Object.assign({}, payerBalances);

    // void function that subtracts points from multiple sources
    subtractPoints(value.points);

    const changes = getBalanceDifferences(payerBalanceChanges, payerBalances);

    res.send(changes);
  } else {
    res.sendStatus(400);
  }
});

const server = app.listen(port, () => {
  console.log("App listening at http://localhost:5000");
});

module.exports = server;

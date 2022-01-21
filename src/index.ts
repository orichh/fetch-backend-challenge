import express, { Request, Response, Application } from "express";
import Joi from "joi";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import fs from "fs";
import pinoHttp from "pino-http";
import path from "path";
import { redisClient } from "./redis";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

// TODO: Extract functions into separate file to de-clutter
/*
  TODO: Would use database's native sorting methods for faster sorting in production
  For small-scale testing, JS's native sort method works for now
*/

// initialize server
const app: Application = express();

// Create server logging stream to access log file
// prettier-ignore
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
const logger = pinoHttp(
  {
    customLogLevel: (res: any, err: any) =>
      res.statusCode >= 500 ? "error" : "info",
  },
  accessLogStream
);

// express middleware
// prettier-ignore
config(); // dotenv process
app.use(express.json()); // parse JSON payloads
app.use(cors());
app.use(helmet()); // set security-related HTTP response headers
const expressRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(expressRateLimiter); // limits amount of requests to the server
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
redisClient.set("payerBalances", JSON.stringify(payerBalances));

////////////////////
/////
/////
///// HELPER FUNCTIONS FOR ENDPOINTS
/////
/////
////////////////////

// add points: void function to add points.
const addPoints = ({ payer, points, timestamp }: Transaction): void => {
  // convert to isoDate to milliseconds for sort comparison
  timestamp = +new Date(timestamp);

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
  userTotalPoints = Object.values(payerBalances).reduce((a, b) => a + b);
};

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

      // reduce pointsToSpend by the latest transaction's points
      pointsToSpend -= latestTransaction.points;
    } else {
      // if latest transaction is greater than spend amount
      // reduce points from payer balance of latest transaction
      payerBalances[latestTransaction.payer] -= pointsToSpend;

      // reduce points from latest transaction
      userTransactions[userTransactions.length - 1].points -= pointsToSpend;

      // set pointsToSpend to zero if latest transaction was enough to cover
      pointsToSpend = 0;
    }
  }
  userTotalPoints = Object.values(payerBalances).reduce((a, b) => a + b);
};

// subtract (spend) points: Return changes in balances
const getBalanceDifferences = (
  payerBalanceChanges: { [key: string]: number },
  payerBalances: { [key: string]: number }
) => {
  let arr = [];
  for (const [payer, points] of Object.entries(payerBalances)) {
    if (payerBalanceChanges[payer] === points) {
      delete payerBalanceChanges[payer];
    } else {
      arr.push({ payer: payer, points: points - payerBalanceChanges[payer] });
      payerBalanceChanges[payer] = points - payerBalanceChanges[payer];
    }
  }

  return arr;
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
  res.send("Go to the endpoint localhost:5000/api-docs for more information");
});

app.get("/points/:user_id", (req: Request, res: Response) => {
  // Log requests and responses
  logger(req, res);
  req.log.info("/points/:user_id");

  // Redis caching payer balances -- for example purposes
  redisClient.get("payerBalances").then((results) => {
    if (!results) {
      // if key isn't stored in cache
      redisClient.set("payerBalances", JSON.stringify(payerBalances));
      redisClient.get("payerBalances").then((results) => {
        res.send(JSON.parse(results!));
      });
    } else {
      res.send(JSON.parse(results));
    }
  });
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
  // Log requests and responses
  logger(req, res);
  req.log.info("/points/:user_id/add");

  // Validate request object
  const { error, value } = addPointsSchema.validate(req.body);

  if (error === undefined) { // add transaction to userTransactions if valid request
    // add points
    addPoints(value)

    // set new value for payerBalances in Redis cache
    redisClient.set('payerBalances', JSON.stringify(payerBalances))

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
  // Log requests and responses
  logger(req, res);
  req.log.info("/points/:user_id/subtract");

  // Validate request object
  const { error, value } = subtractPointsSchema.validate(req.body);

  if (error === undefined && value.points <= userTotalPoints) {
    const payerBalanceChanges = Object.assign({}, payerBalances);

    // void function that subtracts points from multiple sources
    subtractPoints(value.points);

    // assign new object containing differences in balance
    const changes = getBalanceDifferences(payerBalanceChanges, payerBalances);

    // set new value for payerBalances in Redis cache
    redisClient.set("payerBalances", JSON.stringify(payerBalances));

    res.send(changes);
  } else {
    res.sendStatus(400);
  }
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("App listening at http://localhost:5000");
});

module.exports = server;

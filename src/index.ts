import express, { Request, Response, Application } from "express";
import Joi from "joi";
import helmet from "helmet";

// initialize server
const port = process.env.PORT || 5000;
const app: Application = express();

// express middleware
app.use(express.json()); // parse JSON payloads
app.use(helmet()); // set security-related HTTP response headers

// initialize temporary data storage, array of arrays for sorting
let tracker: { payer: string; points: number; timestamp: string }[][] = [];

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

// add points: client request body validation schema
// prettier-ignore
const transactionSchema = Joi.object({
  payer: Joi.string().pattern(/^[A-Z]+$/, "capital letters").required(), // check payer and for A-Z chars
  points: Joi.number().integer().required(), // check points and if integer
  timestamp: Joi.string().isoDate().required(), // check timestamp is isoDate
});

// add points to a user's balance
// prettier-ignore
app.post("/points/:user_id/add", (req: Request, res: Response) => {
  const { error, value } = transactionSchema.validate(req.body);
  if (error === undefined) { // if valid input
    tracker.push([value]);
    res.send(tracker);
  } else { // if bad input
    res.sendStatus(400);
  }
});

// subtract (spend) points from a user's balance
app.post("/points/:user_id/subtract", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

const server = app.listen(port, () => {
  console.log("App listening at http://localhost:5000");
});

module.exports = server;

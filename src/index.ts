import express from "express";
import { Request, Response, Application } from "express";

const port = process.env.PORT || 5000;
const app: Application = express();

// express middleware
app.use(express.json());

// endpoints
app.get("/", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

app.get("/points/:user_id", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

app.post("/points/:user_id/add", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

app.post("/points/:user_id/subtract", (req: Request, res: Response) => {
  console.log("hit");
  res.sendStatus(200);
});

const server = app.listen(port, () => {
  console.log("App listening at http://localhost:5000");
});

module.exports = server;

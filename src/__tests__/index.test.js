const request = require("supertest");
const server = require("./../index.ts");

describe("GET /points/:user_id", () => {
  afterEach(() => {
    server.close();
  });
  it("should respond with a 200", async () => {
    const response = await request(server).get("/points/1");
    expect(response.status).toEqual(200);
  });
  it("should return an object", async () => {
    const response = await request(server).get("/points/1");
    expect(typeof response.body).toEqual("object");
  });
});

describe("POST /points/:user_id/add", () => {
  afterEach(() => {
    server.close();
  });

  it("should add transaction to balance", async () => {
    const response = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          payer: "UNLEVER",
          points: 2000,
          timestamp: "2014-09-02T12:00:00Z",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    const pointsResponse = await request(server).get("/points/1");
    expect(pointsResponse.body["UNLEVER"]).toEqual(2000);
  });
  it("should send 400 error if payer isn't A-Z characters", async () => {
    let response = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          payer: "300",
          points: 2000,
          timestamp: "2014-09-02T12:00:00Z",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toEqual(400);
  });
  it("should send 400 error if points isn't an integer", async () => {
    let response = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          payer: "DANNON",
          points: 2.1,
          timestamp: "2014-09-02T12:00:00Z",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toEqual(400);
  });
  it("should send 400 error if timestamp isn't a valid isoDate", async () => {
    let response = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          payer: "DANNON",
          points: 2,
          timestamp: "2014-09-02T12:0t",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toEqual(400);
  });
  it("should send 400 error if missing any of the expected properties", async () => {
    let response = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          // payer: "DANNON",
          points: 2,
          timestamp: "2014-09-02T12:0t",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toEqual(400);
  });
});

describe("POST /points/:user_id/subtract", () => {
  afterEach(() => {
    server.close();
  });

  it("should subtract from balance", async () => {
    const responseAfterAdding = await request(server)
      .post("/points/:user_id/add")
      .send(
        JSON.stringify({
          payer: "UNLEVER",
          points: 2000,
          timestamp: "2014-09-02T12:00:00Z",
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    let pointsResponse = await request(server).get("/points/1");
    // TODO: setting expect to equal 4000 for now as server isn't closing correctly
    // after each test, so prior changes still active
    expect(pointsResponse.body["UNLEVER"]).toEqual(4000);
    expect(responseAfterAdding.status).toEqual(201);

    const responseAfterSubtracting = await request(server)
      .post("/points/1/subtract")
      .send(
        JSON.stringify({
          points: 2000,
        })
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    pointsResponse = await request(server).get("/points/1");
    expect(pointsResponse.body["UNLEVER"]).toEqual(2000);
    expect(responseAfterSubtracting.status).toEqual(200);
    expect(typeof responseAfterSubtracting.body).toEqual("object");
    expect(responseAfterSubtracting.body["UNLEVER"]).toEqual(-2000);
  });
});

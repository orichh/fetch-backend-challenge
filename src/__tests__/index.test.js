const request = require("supertest");
const server = require("./../index.ts");

describe("Express server tests", () => {
  afterEach(() => {
    server.close();
  });
  it("Root endpoint should respond with a 200", () => {
    return request(server).get("/").expect(200);
  });
  it("should respond with a 200", () => {
    return request(server).get("/points/1").expect(200);
  });
  it("should respond with a 200", () => {
    return request(server).post("/points/1/add").expect(200);
  });
  it("should respond with a 200", () => {
    return request(server).post("/points/1/subtract").expect(200);
  });
});

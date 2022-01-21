import * as redis from "redis";

const redisClient = redis.createClient();
// const redisClient = redis.createClient({
//   socket: { port: 6379, host: "redis" },
// });

redisClient.connect();
redisClient.on("connect", () => {
  console.log("connecting to redis");
});

redisClient.on("ready", () => {
  console.log("connected to redis");
});

redisClient.on("end", () => {
  console.log("redis connection disconnected");
});

redisClient.on("reconnecting", () => {
  console.log("reconnecting to redis");
});

redisClient.on("error", (err) => {
  console.log("Error " + err);
});

export { redisClient };

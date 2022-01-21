<h1 align="center">Fetch Rewards Coding Exercise - Backend Software Engineering</h1>

<table align="center">
  <tr>
    <td align="center"><a href="https://github.com/richardhyesungo"><img src="https://avatars.githubusercontent.com/u/18966944?v=4" width="100px;" alt=""/><br /><sub><b>Richard O</b></sub></a><br /></td>
  </tr>
</table>

## Overview
1. Kanban Board: https://github.com/richardhyesungo/fetch-backend-challenge/projects/1
2. [**Tech Stack**](#tech-stack)
3. [**Repo Instructions**](#2-ways-to-run-this-application)
4. [**Possible Improvements**](#possible-improvements-and-additional-features)

## Tech Stack:
1. JavaScript / TypeScript
2. Express.js
3. Jest / Supertest
4. Prettier
5. Docker / Docker-compose
6. React via create-react-app
7. Redis
8. Pino / Pino-http
9. Forever

# 2 Ways to Run This Application:
1. With Docker and `docker-compose up`
2. Without Docker using `npm start`

### Available Endpoints:
1. GET - "localhost:5000/points/1" -> get points
2. POST - "localhost:5000/points/1/add" -> add points
3. POST - "localhost:5000/points/1/subtract" -> subtract points

### Running with Docker
1. Make sure you have docker and docker-compose installed beforehand
2. Open terminal on local machine
3. Run `git clone git@github.com:richardhyesungo/fetch-backend-challenge.git`
4. Run `cd fetch-backend-challenge` to move into the repo folder
5. Make sure that the `/src/redis.ts` file has redis client docker configuration like below:
    ```
    const redisClient = redis.createClient({
      socket: { port: 6379, host: "redis" },
    });
    ```
7. Create docker image by running the terminal command `docker build -t "fbc" ./`
8. Run the express server with the terminal command `docker-compose up`

### Running without docker
1. Open terminal on local machine
2. Run `git clone git@github.com:richardhyesungo/fetch-backend-challenge.git`
3. Run `cd fetch-backend-challenge` to move into the repo folder
4. Make sure that the `/src/redis.ts` file has redis client local configuration like below:
    ```
    const redisClient = redis.createClient();
    ```
5. Run `npm ci` to install dependencies
6. Run `npm start` to run the server

## Optional - Run React front-end for simple interface with the server
1. From the root of the fetch-backend-challenge folder, run `cd client`
2. Run `npm install`
3. Run `npm start`
4. Open browser and navigate to the url `localhost:3000` if not automatically redirected
5. The payer input only accepts characters from A-Z and adds 300 points to that payer
6. The 'Spend Points' input only accepts positive integers, and will not process if the spend points exceed available points

![ezgif com-gif-maker (5)](https://user-images.githubusercontent.com/18966944/150441525-7228647c-63bd-4cb5-8b34-5187693077e6.gif)

## Possible Improvements and Additional Features
1. Increase test coverage and add unit testing for functions
2. Load test and optimize
3. Extract helper functions into separate file to reduce clutter of index.js
4. Improve access.log logging details by including unhandledexception and unhandledrejection errors
5. Create a package.json build script to transpile typescript files into a dist folder to run
6. Monitor response times, memory, and CPU usage using a tool like New Relic
7. Implement the :user_id by determining points per user

# Fetch Rewards Coding Exercise - Backend Software Engineering

Kanban Board: https://github.com/richardhyesungo/fetch-backend-challenge/projects/1

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
1. With `docker-compose up`
2. Without docker-compose using `npm start`

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
8. Run the express server the terminal command `docker-compose up`

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

![ezgif com-gif-maker (4)](https://user-images.githubusercontent.com/18966944/150441085-49baff47-5a67-447a-831d-48ae5ef2ffa3.gif)


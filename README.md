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

## 2 Ways to Run This Application:
1. With `docker-compose up`
2. Without docker-compose using `npm start`

## Running with Docker
1. Make sure you have docker and docker-compose installed beforehand
2. Open terminal on local machine
3. Run `git clone git@github.com:richardhyesungo/fetch-backend-challenge.git`
4. Run `cd fetch-backend-challenge` to move into the repo folder
5. Create docker image by running the terminal command `docker build -t "fbc" ./`
6. Run the express server the terminal command `docker-compose up`

## Running without docker
1. Open terminal on local machine
2. Run `git clone git@github.com:richardhyesungo/fetch-backend-challenge.git`
3. Run `cd fetch-backend-challenge` to move into the repo folder
4. Run `npm ci` to install dependencies
5. Run `npm start` to run the server

## Optional - Run React front-end for simple interface with the server
1. From the root of the fetch-backend-challenge folder, run `cd client`
2. Run `npm start`
3. 

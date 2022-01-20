build:
	docker build -t "fbc" ./

run:
	docker run -d -p 5000:5000 fbc
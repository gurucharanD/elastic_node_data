include env_config
include .env

# The release agent just runs 'make' and expects a built docker image from it.
default: build

DOCKER='docker'
DOCKER_COMPOSE='docker-compose'

dc-build:
	rm -rf dist
	$(DOCKER_COMPOSE) build app

# ---------- Development ----------
start: dc-build
		$(DOCKER_COMPOSE) run -e NODE_ENV=development --service-ports --entrypoint=npm app run start

debug: dc-build
		$(DOCKER_COMPOSE) run -e NODE_ENV=development --service-ports --entrypoint=npm app run debug

start-nodemon: dc-build	
	$(DOCKER_COMPOSE) run -e NODE_ENV=development --service-ports --entrypoint=npm app run dev


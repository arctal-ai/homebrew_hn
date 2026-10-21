CYAN = \033[0;36m
GREEN = \033[0;32m
RESET = \033[0m

.PHONY: help install run build start-prod lint format test

default: help

help: ## shows this help message
	@grep -E '^##|^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; \
	/^## / { \
		sub(/^## /, ""); \
		printf "\033[1;35m%s\033[0m\n", $$0; \
		next; \
	} \
	/^[a-zA-Z_-]+:.*?## / { \
		printf "\033[36m%-32s\033[0m %s\n", $$1, $$2; \
	}'


install: ## installs dependencies
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	npm install
	@echo "$(GREEN)Dependencies installed$(RESET)"

update: ## updates dependencies
	@echo "$(CYAN)Updating dependencies...$(RESET)"
	npm update
	@echo "$(GREEN)Dependencies updated$(RESET)"

run: ## starts the development server
	@echo "$(CYAN)Starting development server...$(RESET)"
	npm run dev
	@echo "$(GREEN)Development server started$(RESET)"

build: ## builds the production server
	@echo "$(CYAN)Building for production...$(RESET)"
	npm run build
	@echo "$(GREEN)Build completed$(RESET)"

start-prod: ## starts the production server
	@echo "$(CYAN)Starting production server...$(RESET)"
	npm run start
	@echo "$(GREEN)Production server started$(RESET)"

lint: ## runs linting
	@echo "$(CYAN)Running linting...$(RESET)"
	npm run lint
	@echo "$(GREEN)Linting completed$(RESET)"

format: ## runs formatting
	@echo "$(CYAN)Running formatting...$(RESET)"
	npm run format
	@echo "$(GREEN)Formatting completed$(RESET)"

test: ## runs tests
	@echo "$(CYAN)Running tests...$(RESET)"
	npm run test
	@echo "$(GREEN)Tests completed$(RESET)"

prepare:  format lint test ## pre commit tasks
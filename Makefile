.PHONY: start down

#################################################################################
# Globals
#################################################################################

START_COMMAND = docker-compose -f ./services/docker-compose.yaml up --build

#################################################################################
# COMMANDS
#################################################################################

start:
	$(START_COMMAND) backend backend-database backend-database-migrate marketing frontend frontend-storybook

start-no-storybook:
	$(START_COMMAND) backend backend-database backend-database-migrate marketing frontend

start-all:
	$(START_COMMAND)

start-prod:
	docker-compose -f ./services/docker-compose.production.yaml up --build

start-cypress-parallel:
	bash ./scripts/cypress_start_parallel_services.sh yes

down-cypress-parallel:
	bash ./scripts/cypress_down_parallel_services.sh

down:
	docker-compose -f ./services/docker-compose.yaml down -v

lint-backend-locally:
	docker-compose -f ./services/docker-compose.yaml exec backend npm run lint

lint-frontend-locally:
	docker-compose -f ./services/docker-compose.yaml exec frontend npm run lint:all

test-backend-locally:
	docker-compose -f ./services/docker-compose.yaml exec backend npm run lint

test-frontend-locally:
	docker-compose -f ./services/docker-compose.yaml exec frontend npm run test

ci-backend-locally:
	docker-compose -f ./services/docker-compose.yaml exec backend npm run ci

ci-marketing-locally:
	docker-compose -f ./services/docker-compose.yaml exec marketing npm run ci

ci-frontend-locally:
	docker-compose -f ./services/docker-compose.yaml exec frontend npm run ci

watch-frontend-tests:
	docker-compose -f ./services/docker-compose.yaml exec frontend npm run test:watch

watch-frontend-tsc:
	docker-compose -f ./services/docker-compose.yaml exec frontend npm run tsc:watch

open-frontend-cypress:
	cd services/frontend && npm run cypress:open

run-frontend-cypress:
	cd services/frontend && npm run cypress

run-frontend-cypress-parallel:
	bash ./scripts/cypress_run_parallel.sh yes

inspect-database:
	docker-compose -f ./services/docker-compose.yaml exec backend-database psql app-database app-database-user

#################################################################################
# SELF DOCUMENTING COMMANDS
#################################################################################

.DEFAULT_GOAL := show-help

# Inspired by <http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html>
# sed script explained:
# /^##/:
# 	* save line in hold space
# 	* purge line
# 	* Loop:
# 		* append newline + line to hold space
# 		* go to next line
# 		* if line starts with doc comment, strip comment character off and loop
# 	* remove target prerequisites
# 	* append hold space (+ newline) to line
# 	* replace newline plus comments by `---`
# 	* print line
# Separate expressions are necessary because labels cannot be delimited by
# semicolon; see <http://stackoverflow.com/a/11799865/1968>
.PHONY: show-help
show-help:
	@echo "$$(tput bold)Available rules:$$(tput sgr0)"
	@echo
	@sed -n -e "/^## / { \
		h; \
		s/.*//; \
		:doc" \
		-e "H; \
		n; \
		s/^## //; \
		t doc" \
		-e "s/:.*//; \
		G; \
		s/\\n## /---/; \
		s/\\n/ /g; \
		p; \
	}" ${MAKEFILE_LIST} \
	| LC_ALL='C' sort --ignore-case \
	| awk -F '---' \
		-v ncol=$$(tput cols) \
		-v indent=19 \
		-v col_on="$$(tput setaf 6)" \
		-v col_off="$$(tput sgr0)" \
	'{ \
		printf "%s%*s%s ", col_on, -indent, $$1, col_off; \
		n = split($$2, words, " "); \
		line_length = ncol - indent; \
		for (i = 1; i <= n; i++) { \
			line_length -= length(words[i]) + 1; \
			if (line_length <= 0) { \
				line_length = ncol - indent - length(words[i]) - 1; \
				printf "\n%*s ", -indent, " "; \
			} \
			printf "%s ", words[i]; \
		} \
		printf "\n"; \
	}' \
	| more $(shell test $(shell uname) = Darwin && echo '--no-init --raw-control-chars')

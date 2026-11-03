.PHONY: setup dev test ci

setup:
	@bash scripts/setup.sh

dev:
	@set -a; . ./.env; set +a; \
	npm run dev --workspace=apps/api & \
	npm run dev --workspace=apps/web & \
	wait

test:
	@npm test

ci:
	@npm run lint
	@npm run typecheck
	@npm test
	@npm run build

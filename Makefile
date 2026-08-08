NPM ?= npm
TEST_COMMAND ?= $(NPM) test
PACK_COMMAND ?= $(NPM) pack --dry-run

.PHONY: test pack preflight release release-patch release-minor release-major

test:
	$(TEST_COMMAND)

pack:
	$(PACK_COMMAND)

preflight:
	@status="$$(git status --porcelain)"; \
	if [ -n "$$status" ]; then \
		echo "Erro: a árvore Git deve estar limpa antes do release." >&2; \
		exit 1; \
	fi
	@git remote get-url origin >/dev/null 2>&1 || { echo "Erro: remote origin não configurado." >&2; exit 1; }

release-patch: VERSION_TYPE=patch
release-patch: release

release-minor: VERSION_TYPE=minor
release-minor: release

release-major: VERSION_TYPE=major
release-major: release

release: preflight test pack
	npm version $(VERSION_TYPE)
	@version="$$(node -p "require('./package.json').version")"; \
	git push --atomic origin HEAD "v$$version"

REPORTER = spec

test-api:
	@./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--ui bdd \
	tests/*.js

test-all: test-api
test: test-all

.PHONY: test-all
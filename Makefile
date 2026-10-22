.DEFAULT_GOAL := help

HUGO ?= hugo

.PHONY: help build serve clean size

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

build: ## Build the site into public/
	$(HUGO) --minify --gc

serve: ## Serve locally with draft posts
	$(HUGO) server --buildDrafts --navigateToChanged --renderToMemory

clean: ## Remove build artifacts and the image cache
	rm -rf public resources/_gen .hugo_build.lock

size: build ## Report the published size (GitHub Pages cap: 1024 MB)
	@du -sh public

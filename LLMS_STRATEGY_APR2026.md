# Starknet Docs LLM Discoverability Strategy (April 2026)

This repository uses a curated `llms.txt` to improve retrieval quality for AI assistants and answer engines while keeping full coverage in `llms-full.txt`.

## Why Curated `llms.txt`

The default auto-generated file is exhaustive, but it can dilute relevance when high-value paths are mixed with large generated sections (for example thousands of reference pages). A curated file improves:

- First-hop retrieval precision.
- Agent routing to canonical pages.
- Lower-context handoff for answer engines.

`llms-full.txt` remains the exhaustive fallback for deep context.

## Current Decisions

1. Override root `llms.txt` with high-signal links and short descriptions.
2. Keep links in Markdown form (`.md`) so agents can fetch source Markdown directly.
3. Keep `llms-full.txt` and `sitemap.xml` linked from the `Optional` section.
4. Enforce format and local-link integrity with `scripts/validate_llms_txt.py`.
5. Run CI check (`.github/workflows/llms-check.yml`) on PRs and pushes to `main`.

## Crawler and Robots Guidance

For visibility, ensure `robots.txt` continues to allow search-focused agents and major web crawlers.

- OpenAI: `OAI-SearchBot` controls search inclusion. `GPTBot` is a separate training crawler.
- Anthropic: `Claude-SearchBot` is search; `ClaudeBot` is training; `Claude-User` is user-triggered fetch.
- Perplexity: `PerplexityBot` is search indexing; `Perplexity-User` is user-triggered fetch.

Note: user-triggered fetchers may not always obey robots in the same way as autonomous crawlers.
OpenAI and Perplexity both note propagation delays up to about 24 hours after robots changes.

## Operating Model

When adding or removing major docs sections:

1. Update `llms.txt` to keep the curated map current.
2. Keep descriptions action-oriented and concise.
3. Prefer canonical docs URLs and avoid duplicates.
4. Run `python scripts/validate_llms_txt.py` locally before opening PR.

## Review Cadence

- Monthly check of crawler guidance and user-agent names.
- Quarterly cleanup of stale links and duplicated surface area.
- Immediate update after major docs IA changes.

## Primary References

- OpenAI crawler controls: https://developers.openai.com/api/docs/bots
- Anthropic crawler controls: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity crawler controls: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- llms.txt proposal/spec overview: https://llmstxt.org/
- Mintlify llms support and headers: https://www.mintlify.com/docs/ai/llmstxt
- Google crawl/index fundamentals: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google sitemap fundamentals: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Cloudflare AI crawler control guidance: https://developers.cloudflare.com/style-guide/how-we-docs/how-we-ai/control-ai-crawls/

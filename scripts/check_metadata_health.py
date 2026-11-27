#!/usr/bin/env python3
"""Check live docs metadata that helps search engines and AI tools discover pages.

This is intentionally a live-site health check, not a content-quality linter. It
hard-fails only on regressions that break indexing/discovery for representative
docs pages. We keep softer quality signals, such as missing descriptions, as
warnings so normal docs authors are not blocked by unrelated site-wide metadata
debt.
"""

from __future__ import annotations

import argparse
import html
import random
import sys
import time
from dataclasses import dataclass
from html.parser import HTMLParser
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "https://docs.starknet.io"
USER_AGENT = "starknet-docs-metadata-health-check/1.0"
TIMEOUT_SECONDS = 8
MAX_ATTEMPTS = 2
RETRYABLE_HTTP_STATUSES = {408, 409, 425, 429, 500, 502, 503, 504}
DESCRIPTION_MIN_LENGTH = 40
DESCRIPTION_MAX_LENGTH = 320


@dataclass(frozen=True)
class TargetPage:
    path: str
    label: str


TARGET_PAGES = (
    TargetPage("/", "Docs homepage"),
    TargetPage("/build/quickstart/overview", "Build quickstart overview"),
    TargetPage("/build/starknet-by-example", "Starknet by Example"),
    TargetPage("/build/starkzap/using-llms", "Starkzap LLM workflow"),
    TargetPage("/learn/intro", "Learn Starknet"),
    TargetPage("/learn/protocol/intro", "Protocol introduction"),
    TargetPage("/learn/protocol/accounts", "Accounts"),
    TargetPage("/learn/protocol/transactions", "Transactions"),
    TargetPage("/learn/protocol/fees", "Fees"),
    TargetPage("/learn/cheatsheets/version-notes", "Version notes"),
    TargetPage("/secure/quickstart/overview", "Secure Starknet overview"),
)


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self.meta_by_name: dict[str, list[str]] = {}
        self.meta_by_property: dict[str, list[str]] = {}
        self.links_by_rel: dict[str, list[str]] = {}
        self.json_ld_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attr_map = {name.lower(): value or "" for name, value in attrs}

        if tag == "title":
            self._in_title = True
            return

        if tag == "meta":
            content = html.unescape(attr_map.get("content", "")).strip()
            if not content:
                return
            name = attr_map.get("name", "").strip().lower()
            prop = attr_map.get("property", "").strip().lower()
            if name:
                self.meta_by_name.setdefault(name, []).append(content)
            if prop:
                self.meta_by_property.setdefault(prop, []).append(content)
            return

        if tag == "link":
            href = attr_map.get("href", "").strip()
            rels = attr_map.get("rel", "").strip().lower().split()
            for rel in rels:
                if href:
                    self.links_by_rel.setdefault(rel, []).append(href)
            return

        if tag == "script":
            script_type = attr_map.get("type", "").strip().lower()
            if script_type == "application/ld+json":
                self.json_ld_count += 1

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False


def normalize_origin(raw_base_url: str) -> str:
    parsed = urlparse(raw_base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("--base-url must be an http(s) origin")
    if parsed.path not in {"", "/"} or parsed.params or parsed.query or parsed.fragment:
        raise ValueError("--base-url must be an origin only, for example https://docs.starknet.io")
    return f"{parsed.scheme}://{parsed.netloc}"


def request_url(url: str) -> tuple[int, dict[str, list[str]], str]:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urlopen(req, timeout=TIMEOUT_SECONDS) as response:
                headers = {
                    key.lower(): response.headers.get_all(key) or []
                    for key in response.headers.keys()
                }
                body = response.read().decode("utf-8", "replace")
                return response.status, headers, body
        except HTTPError as exc:
            if exc.code not in RETRYABLE_HTTP_STATUSES or attempt == MAX_ATTEMPTS:
                headers = {
                    key.lower(): exc.headers.get_all(key) or []
                    for key in exc.headers.keys()
                }
                body = exc.read().decode("utf-8", "replace")
                return exc.code, headers, body
            last_error = exc
        except (TimeoutError, URLError) as exc:
            last_error = exc
            if attempt == MAX_ATTEMPTS:
                raise

        sleep_seconds = min(2 ** (attempt - 1), 8) + random.uniform(0, 0.25)
        time.sleep(sleep_seconds)

    raise RuntimeError(f"unreachable retry state for {url}: {last_error}")


def header_values(headers: dict[str, list[str]], name: str) -> list[str]:
    return headers.get(name.lower(), [])


def has_noindex(headers: dict[str, list[str]], parser: MetadataParser) -> bool:
    robots_values = []
    robots_values.extend(header_values(headers, "x-robots-tag"))
    robots_values.extend(parser.meta_by_name.get("robots", []))
    robots_values.extend(parser.meta_by_name.get("googlebot", []))

    for value in robots_values:
        directives = {directive.strip().lower() for directive in value.split(",")}
        if "none" in directives or "noindex" in directives:
            return True
    return False


def expected_canonical(base_url: str, path: str) -> str:
    if path == "/":
        return base_url
    return f"{base_url}{path}"


def validate_page(base_url: str, target: TargetPage) -> tuple[list[str], list[str]]:
    url = urljoin(base_url + "/", target.path.lstrip("/"))
    errors: list[str] = []
    warnings: list[str] = []

    try:
        status, headers, body = request_url(url)
    except (TimeoutError, URLError) as exc:
        errors.append(f"{target.path}: failed to fetch {url}: {exc}")
        return errors, warnings

    if status != 200:
        return [f"{target.path}: expected HTTP 200, got {status}"], warnings

    content_types = ", ".join(header_values(headers, "content-type")).lower()
    if "text/html" not in content_types:
        errors.append(f"{target.path}: expected text/html content-type, got {content_types or 'missing'}")

    parser = MetadataParser()
    parser.feed(body)

    title = " ".join(parser.title.split())
    if len(title) < 8:
        errors.append(f"{target.path}: missing or too-short <title>")
    elif "starknet" not in title.lower():
        warnings.append(f"{target.path}: title does not include 'Starknet': {title!r}")

    canonical_values = parser.links_by_rel.get("canonical", [])
    if not canonical_values:
        errors.append(f"{target.path}: missing canonical link")
    else:
        canonical = canonical_values[0].rstrip("/")
        expected = expected_canonical(base_url, target.path).rstrip("/")
        if canonical != expected:
            errors.append(f"{target.path}: canonical {canonical!r} does not match expected {expected!r}")

    if has_noindex(headers, parser):
        errors.append(f"{target.path}: page is marked noindex")

    descriptions = parser.meta_by_name.get("description", [])
    if not descriptions:
        warnings.append(f"{target.path}: missing meta description")
    else:
        description = " ".join(descriptions[0].split())
        if len(description) < DESCRIPTION_MIN_LENGTH:
            warnings.append(f"{target.path}: meta description is short ({len(description)} chars)")
        if len(description) > DESCRIPTION_MAX_LENGTH:
            warnings.append(f"{target.path}: meta description is long ({len(description)} chars)")

    og_titles = parser.meta_by_property.get("og:title", [])
    twitter_titles = parser.meta_by_name.get("twitter:title", [])
    if not og_titles:
        warnings.append(f"{target.path}: missing og:title")
    if not twitter_titles:
        warnings.append(f"{target.path}: missing twitter:title")
    if parser.json_ld_count == 0:
        warnings.append(f"{target.path}: missing application/ld+json structured data")

    if not errors:
        print(f"OK {target.path} ({target.label})")
    return errors, warnings


def run(base_url: str, targets: Iterable[TargetPage]) -> int:
    targets = tuple(targets)
    errors: list[str] = []
    warnings: list[str] = []

    for target in targets:
        page_errors, page_warnings = validate_page(base_url, target)
        errors.extend(page_errors)
        warnings.extend(page_warnings)

    if warnings:
        print("\nWarnings (non-blocking):")
        for warning in warnings:
            print(f"- {warning}")

    if errors:
        print("\nMetadata health check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"\nmetadata health check passed for {base_url} ({len(targets)} pages, {len(warnings)} warnings)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Docs origin to check. Defaults to {DEFAULT_BASE_URL}",
    )
    args = parser.parse_args()

    try:
        base_url = normalize_origin(args.base_url)
    except ValueError as exc:
        print(f"Invalid base URL: {exc}", file=sys.stderr)
        return 1

    return run(base_url, TARGET_PAGES)


if __name__ == "__main__":
    raise SystemExit(main())

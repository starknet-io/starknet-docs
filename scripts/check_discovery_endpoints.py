#!/usr/bin/env python3
"""
Check live discovery endpoints for docs.starknet.io.

This complements validate_llms_txt.py: the local validator checks repository
format and link integrity, while this script checks the deployed discovery
surface that agents and crawlers actually fetch.
"""

from __future__ import annotations

import argparse
import random
import re
import sys
import time
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "https://docs.starknet.io"
TIMEOUT_SECONDS = 15
USER_AGENT = "starknet-docs-discovery-check/1.0"
MAX_ATTEMPTS = 4
RETRYABLE_STATUSES = {429, 500, 502, 503, 504}


@dataclass(frozen=True)
class Response:
    url: str
    status: int
    headers: dict[str, list[str]]
    body: str


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def collect_headers(headers: object) -> dict[str, list[str]]:
    collected: dict[str, list[str]] = {}
    for key, value in headers.items():
        collected.setdefault(key.lower(), []).append(value)
    return collected


def retry_delay_seconds(attempt: int) -> float:
    return min(2 ** (attempt - 1), 8) + random.uniform(0, 0.25)


def fetch(url: str, *, method: str = "GET") -> Response:
    request = Request(url, method=method, headers={"User-Agent": USER_AGENT})
    last_error: str | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                body = response.read().decode("utf-8", errors="replace")
                headers = collect_headers(response.headers)
                return Response(url=url, status=response.status, headers=headers, body=body)
        except HTTPError as error:
            body = error.read().decode("utf-8", errors="replace")
            headers = collect_headers(error.headers)
            if error.code not in RETRYABLE_STATUSES or attempt == MAX_ATTEMPTS:
                return Response(url=url, status=error.code, headers=headers, body=body)
            last_error = f"HTTP {error.code}"
        except URLError as error:
            last_error = str(error.reason)
            if attempt == MAX_ATTEMPTS:
                fail(f"failed to fetch {url} after {MAX_ATTEMPTS} attempts: {last_error}")

        print(f"retrying {url} after attempt {attempt}/{MAX_ATTEMPTS}: {last_error}")
        time.sleep(retry_delay_seconds(attempt))

    fail(f"failed to fetch {url}: {last_error}")


def assert_status(response: Response, expected: int = 200) -> None:
    if response.status != expected:
        fail(f"{response.url} returned HTTP {response.status}, expected {expected}")


def assert_text_content(response: Response) -> None:
    content_types = response.headers.get("content-type", [""])
    for raw_content_type in content_types:
        content_type = str(raw_content_type).split(";", 1)[0].strip().lower()
        if "text/" in content_type or "xml" in content_type:
            return
    fail(f"{response.url} returned unexpected content-type: {content_types!r}")


def assert_body_contains(response: Response, needle: str) -> None:
    if needle not in response.body:
        fail(f"{response.url} does not contain expected text: {needle!r}")


def check_endpoint(base_url: str, path: str, expected_text: str) -> None:
    response = fetch(f"{base_url}{path}")
    assert_status(response)
    assert_text_content(response)
    assert_body_contains(response, expected_text)
    print(f"OK {path}")


def check_homepage_headers(base_url: str) -> None:
    response = fetch(f"{base_url}/", method="HEAD")
    if response.status in {405, 501}:
        response = fetch(f"{base_url}/", method="GET")
    assert_status(response)

    link_header = ", ".join(response.headers.get("link", []))
    llms_header = response.headers.get("x-llms-txt", [""])[0]
    if not re.search(r"""rel\s*=\s*["']llms-txt["']""", link_header, flags=re.I):
        fail(f"{base_url}/ is missing rel=\"llms-txt\" Link header")
    if not re.search(r"""rel\s*=\s*["']llms-full-txt["']""", link_header, flags=re.I):
        fail(f"{base_url}/ is missing rel=\"llms-full-txt\" Link header")
    if llms_header != "/llms.txt":
        fail(f"{base_url}/ has unexpected x-llms-txt header: {llms_header!r}")
    print("OK homepage discovery headers")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    parsed_base_url = urlparse(base_url)
    if parsed_base_url.scheme not in {"http", "https"} or not parsed_base_url.netloc:
        fail("--base-url must be an absolute http:// or https:// URL")
    if (
        parsed_base_url.path
        or parsed_base_url.params
        or parsed_base_url.query
        or parsed_base_url.fragment
    ):
        fail("--base-url must be an origin URL: scheme://host[:port]")

    checks = [
        ("/llms.txt", "# Starknet Documentation"),
        ("/llms-full.txt", "Starknet"),
        ("/.well-known/llms.txt", "# Starknet Documentation"),
        ("/.well-known/llms-full.txt", "Starknet"),
        ("/sitemap.xml", "<urlset"),
        ("/robots.txt", f"Sitemap: {base_url}/sitemap.xml"),
    ]

    for path, expected_text in checks:
        check_endpoint(base_url, path, expected_text)
    check_homepage_headers(base_url)

    print(f"discovery endpoint check passed for {base_url}")


if __name__ == "__main__":
    main()

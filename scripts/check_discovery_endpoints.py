#!/usr/bin/env python3
"""
Check live discovery endpoints for docs.starknet.io.

This complements validate_llms_txt.py: the local validator checks repository
format and link integrity, while this script checks the deployed discovery
surface that agents and crawlers actually fetch.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "https://docs.starknet.io"
TIMEOUT_SECONDS = 15
USER_AGENT = "starknet-docs-discovery-check/1.0"


@dataclass(frozen=True)
class Response:
    url: str
    status: int
    headers: dict[str, str]
    body: str


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def fetch(url: str, *, method: str = "GET") -> Response:
    request = Request(url, method=method, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8", errors="replace")
            headers = {key.lower(): value for key, value in response.headers.items()}
            return Response(url=url, status=response.status, headers=headers, body=body)
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        headers = {key.lower(): value for key, value in error.headers.items()}
        return Response(url=url, status=error.code, headers=headers, body=body)
    except URLError as error:
        fail(f"failed to fetch {url}: {error.reason}")


def assert_status(response: Response, expected: int = 200) -> None:
    if response.status != expected:
        fail(f"{response.url} returned HTTP {response.status}, expected {expected}")


def assert_text_content(response: Response) -> None:
    content_type = response.headers.get("content-type", "")
    if "text/" not in content_type and "xml" not in content_type:
        fail(f"{response.url} returned unexpected content-type: {content_type!r}")


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
    assert_status(response)

    link_header = response.headers.get("link", "")
    llms_header = response.headers.get("x-llms-txt", "")
    if 'rel="llms-txt"' not in link_header:
        fail(f"{base_url}/ is missing rel=\"llms-txt\" Link header")
    if 'rel="llms-full-txt"' not in link_header:
        fail(f"{base_url}/ is missing rel=\"llms-full-txt\" Link header")
    if llms_header != "/llms.txt":
        fail(f"{base_url}/ has unexpected x-llms-txt header: {llms_header!r}")
    print("OK homepage discovery headers")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")

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

#!/usr/bin/env python3
"""
Validate llms.txt format and local link integrity.

Rules:
- First non-empty line must be a single H1.
- Section headings must be H2 (## ...).
- List items must use Markdown links.
- Internal docs links must target docs.starknet.io and resolve to local .mdx pages.
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


REPO_ROOT = Path(__file__).resolve().parents[1]
LLMS_PATH = REPO_ROOT / "llms.txt"
ALLOWED_NON_DOC_PATHS = {
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/llms.txt",
    "/.well-known/llms-full.txt",
    "/sitemap.xml",
}
ITEM_RE = re.compile(r"^- \[([^\]]+)\]\((https://docs\.starknet\.io/[^\s)]+)\)(?:: .+)?$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def normalize_to_local_mdx(path: str) -> Path:
    """
    Convert docs URL path to local file path.
    Example:
      /index.md -> index.mdx
      /build/quickstart/overview.md -> build/quickstart/overview.mdx
    """
    relative = path.lstrip("/")
    if relative == "index.md":
        return REPO_ROOT / "index.mdx"
    if relative.endswith(".md"):
        return REPO_ROOT / f"{relative[:-3]}.mdx"
    return REPO_ROOT / relative


def validate_headings(non_empty: list[tuple[int, str]]) -> int:
    h1_count = 0
    saw_h2 = False
    for line_no, line in non_empty:
        stripped = line.strip()
        if stripped.startswith("# "):
            h1_count += 1
        elif stripped.startswith("## ") and len(stripped) > 3:
            saw_h2 = True
        elif stripped.startswith("#"):
            fail(f"line {line_no}: only H1/H2 headings are allowed, got: {stripped[:40]!r}")
        elif stripped.startswith("- "):
            pass
        elif not saw_h2:
            # Allow short prose intro only before the first section heading.
            pass
        else:
            fail(
                f"line {line_no}: unexpected line (not H1, H2, or list item): {stripped[:40]!r}"
            )

    if h1_count != 1:
        fail(f"llms.txt must contain exactly one H1 heading, found {h1_count}")

    section_count = sum(1 for _, line in non_empty if line.strip().startswith("## "))
    if section_count < 4:
        fail(
            f"llms.txt should contain multiple curated sections (found {section_count}, expected >= 4)"
        )

    return section_count


def parse_list_items(lines: list[str]) -> list[str]:
    urls: list[str] = []

    for line_no, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped.startswith("- "):
            continue
        match = ITEM_RE.match(stripped)
        if not match:
            fail(
                f"line {line_no}: list entries must use '- [title](https://docs.starknet.io/...)[: description]'"
            )
        title, url = match.group(1), match.group(2)
        if not title.strip():
            fail(f"line {line_no}: link title cannot be empty")
        urls.append(url)

    if len(urls) < 20:
        fail(f"llms.txt should be curated but substantial (found {len(urls)} links, expected >= 20)")

    return urls


def verify_urls(urls: list[str]) -> None:
    duplicates = sorted([u for u, count in Counter(urls).items() if count > 1])
    if duplicates:
        fail(f"duplicate URLs found: {duplicates}")

    for url in urls:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.netloc != "docs.starknet.io":
            fail(f"invalid URL domain/scheme: {url}")

        if parsed.path in ALLOWED_NON_DOC_PATHS:
            continue

        if not parsed.path.endswith(".md"):
            fail(
                f"non-curated link must end in .md (or be allowlisted optional artifact): {url}"
            )

        local_file = normalize_to_local_mdx(parsed.path)
        if not local_file.exists():
            fail(f"URL does not map to a local .mdx file: {url} -> {local_file}")


def main() -> None:
    if not LLMS_PATH.exists():
        fail("llms.txt does not exist at repository root")

    text = LLMS_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()

    non_empty = [(i + 1, line) for i, line in enumerate(lines) if line.strip()]
    if not non_empty:
        fail("llms.txt is empty")

    first_line_no, first_line = non_empty[0]
    if not first_line.strip().startswith("# "):
        fail(f"first non-empty line ({first_line_no}) must be an H1 heading")

    section_count = validate_headings(non_empty)
    urls = parse_list_items(lines)
    verify_urls(urls)

    print(
        f"llms.txt validation passed: {len(urls)} links, {section_count} sections, no format/link errors."
    )


if __name__ == "__main__":
    main()

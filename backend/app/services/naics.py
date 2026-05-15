from __future__ import annotations


def get_naics_digit_level(naics_code: str | None) -> int | str | None:
    if not naics_code:
        return None
    code = str(naics_code).strip()
    if "-" in code:
        return "sector_range"
    digits = "".join(ch for ch in code if ch.isdigit())
    if len(digits) in {2, 3, 4, 5, 6}:
        return len(digits)
    return None


def matches_naics_level(naics_code: str | None, level: str | None) -> bool:
    if not level or level == "all":
        return True
    digit_level = get_naics_digit_level(naics_code)
    if level == "sector_range":
        return digit_level == "sector_range"
    return str(digit_level) == str(level)

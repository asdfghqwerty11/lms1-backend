#!/usr/bin/env python3
"""Render the branded LinkedIn images for the August 2026 dental-life post set.

Uses the shared renderer from the linkedin-autopilot skill so the cards stay
on-brand with everything else on the feed.

    python3 content/linkedin/generate_images.py
"""

import os
import sys

SKILL_SCRIPTS = "/root/.claude/skills/linkedin-autopilot/scripts"
sys.path.insert(0, SKILL_SCRIPTS)

from render_image import (  # noqa: E402
    render_hot_take,
    render_data_split,
    render_quote_card,
)

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    cards = [
        (
            "post-1-equipment-emi.png",
            render_hot_take(
                statement="Buy the machine when your cases demand it. Not when the EMI makes it feel affordable.",
                subtext="The excitement of a new machine fades in a month.\nThe instalment stays for years.",
            ),
        ),
        (
            "post-2-one-skill.png",
            render_data_split(
                title="How dentists actually get better",
                left_value="1",
                left_label="Skill,\ndone properly",
                left_sub="Hands-on, supervised, repeated",
                right_value="10",
                right_label="Webinars\nattended",
                right_sub="10 certificates, same hands",
                source="Illustrative",
            ),
        ),
        (
            "post-3-body-asset.png",
            render_quote_card(
                quote="Your clinic is not an asset if your body is the machine running it.",
                attribution="Dr. Vikas Agarwal",
                context="Most dentists retire from their backs long before they retire from their practice.",
            ),
        ),
    ]

    for filename, img in cards:
        path = os.path.join(OUT_DIR, filename)
        img.save(path)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()

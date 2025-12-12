#!/usr/bin/env python3
"""
Download Gmail attachments for ISI Elite Training messages from MBOX files.

Usage:
    export MBOX_PATH="/path/to/mbox/files"
    python3 gmail_attachment_downloader.py
"""

import email
import email.message
import mailbox
import os
import pathlib
import re
import sys
from typing import List, Optional, Tuple


SUBJECT_KEYWORDS = [
    "ISI ELITE TRAINING SARASOTA",
    "ISI ELITE TRAINING COOPER CITY",
    "ISI ELITE TRAINING BUFFALO GROVE",
]

LOCATION_FOLDERS = {
    "SARASOTA": "Sarasota",
    "COOPER CITY": "Cooper City",
    "BUFFALO GROVE": "Buffalo Grove",
}

BASE_DOWNLOAD_DIR = pathlib.Path(
    os.getenv("ATTACHMENT_ROOT", "attachments/isi_elite_training"))
MBOX_PATH = os.getenv("MBOX_PATH", ".")


def subject_matches(subject: Optional[str]) -> bool:
    upper_subject = (subject or "").upper()
    return any(keyword in upper_subject for keyword in SUBJECT_KEYWORDS)


def sanitize_filename(name: str) -> str:
    name = name.strip().replace("/", "_")
    name = re.sub(r"[^\w.\- ]+", "_", name)
    return name or "attachment"


def save_attachments(msg: email.message.Message, message_id: str) -> List[pathlib.Path]:
    """Extract and save attachments from email message"""
    target_dir = BASE_DOWNLOAD_DIR / "All"
    target_dir.mkdir(parents=True, exist_ok=True)

    saved_paths: List[pathlib.Path] = []
    for part in msg.walk():
        if part.get_content_disposition() != "attachment":
            continue
        filename = sanitize_filename(part.get_filename() or "attachment")
        dest = target_dir / filename
        if dest.exists():
            dest = target_dir / f"{dest.stem}_{message_id}{dest.suffix}"

        payload = part.get_payload(decode=True)
        if payload is None or not isinstance(payload, bytes):
            continue

        dest.write_bytes(payload)
        saved_paths.append(dest)

    return saved_paths


def load_mbox_files() -> Tuple[int, int]:
    """Load and process MBOX files from MBOX_PATH"""
    mbox_path = pathlib.Path(MBOX_PATH)

    if not mbox_path.exists():
        raise SystemExit(f"MBOX_PATH does not exist: {MBOX_PATH}")

    matched_messages = 0
    saved_files = 0
    mbox_files = list(mbox_path.glob("*.mbox"))

    if not mbox_files:
        raise SystemExit(f"No .mbox files found in {MBOX_PATH}")

    print(f"Found {len(mbox_files)} MBOX file(s) to process\n")

    for mbox_file in mbox_files:
        print(f"Processing: {mbox_file.name}")
        try:
            mbox = mailbox.mbox(str(mbox_file))
            for i, msg in enumerate(mbox):
                subject = msg.get("Subject", "")

                if not subject_matches(subject):
                    continue

                matched_messages += 1
                msg_id = str(i)
                files = save_attachments(msg, msg_id)
                saved_files += len(files)
                print(f"  [{i}] {subject[:60]} -> saved {len(files)} file(s)")

        except Exception as e:
            print(f"  ✗ Error processing {mbox_file.name}: {e}")
            continue

    return matched_messages, saved_files


def main() -> None:
    """Main entry point"""
    print("=" * 60)
    print("ISI Elite Training - Email Attachment Downloader")
    print("=" * 60)
    print(f"MBOX Path: {MBOX_PATH}")
    print(f"Output Dir: {BASE_DOWNLOAD_DIR}\n")

    matched, saved = load_mbox_files()

    print(f"\n{'=' * 60}")
    print(f"Results: {matched} emails matched, {saved} files saved")
    print(f"Files saved to: {BASE_DOWNLOAD_DIR}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n✗ Interrupted by user")
        sys.exit(130)
    except SystemExit as e:
        print(f"✗ {e}")
        sys.exit(1)

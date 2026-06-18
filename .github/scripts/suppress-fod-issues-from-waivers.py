"""
Suppresses FoD issues whose CVE ID matches a Sonatype waiver.

Reads:
  waivers.json    - produced by sync-sonatype-waivers-to-fod.py
  fod-issues.json - produced by: fcli fod issue list --rel=... --output=json

Required environment variables:
  FOD_RELEASE - FoD release in the format "App Name:release"
"""

import json
import os
import subprocess
import sys

fod_release = os.environ["FOD_RELEASE"]

with open("waivers.json") as f:
    waived = json.load(f).get("waived_cves", [])

with open("fod-issues.json") as f:
    raw = f.read().strip()

issues = json.loads(raw) if raw else []

if not waived:
    print("No waived CVEs — nothing to suppress")
    sys.exit(0)

if not issues:
    print("No open FoD issues found — nothing to suppress")
    sys.exit(0)

waived_cve_ids = {e["cve_id"].upper() for e in waived}
waived_comments = {e["cve_id"].upper(): e["comment"] for e in waived}

# FoD issue fields vary; try common field names for CVE ID
def get_cve_id(issue: dict) -> str:
    for field in ("category", "issueName", "vulnerabilityId"):
        val = issue.get(field, "")
        if val.upper().startswith("CVE-"):
            return val.upper()
    return ""

to_suppress = [
    issue for issue in issues
    if get_cve_id(issue) in waived_cve_ids
]

if not to_suppress:
    print(f"No open FoD issues matched {len(waived_cve_ids)} waived CVE IDs")
    sys.exit(0)

print(f"Suppressing {len(to_suppress)} FoD issue(s) matching Sonatype waivers...")

for issue in to_suppress:
    instance_id = str(issue.get("instanceId", ""))
    cve_id = get_cve_id(issue)
    comment = waived_comments.get(cve_id, "Waived in Sonatype IQ")
    if not instance_id:
        print(f"  Skipping {cve_id} — no instanceId in issue data", file=sys.stderr)
        continue
    subprocess.run(
        [
            "fcli", "fod", "issue", "update",
            f"--rel={fod_release}",
            f"--issue-ids={instance_id}",
            "--suppress=true",
            f"--comment=Suppressed automatically: {comment}",
        ],
        check=True,
    )
    print(f"  Suppressed issue {instance_id} ({cve_id}): {comment}")

print("Done")

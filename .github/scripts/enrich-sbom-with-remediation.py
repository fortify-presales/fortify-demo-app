"""
Enrich a CycloneDX SBOM with Sonatype remediation recommendations.

Reads the SBOM from SBOM_FILE, calls the Sonatype IQ Component Remediation API
for each vulnerable component, and injects a 'recommendation' field (e.g.
"Upgrade to version 3.5.14") into each vulnerability entry before writing the
file back in place.

Required environment variables:
  NEXUS_URL               - Base URL of the Nexus IQ Server (no trailing slash)
  NEXUS_APP_ID            - Internal application ID (UUID from IQ Server)
  NEXUS_STAGE             - Stage ID (e.g. "build")
  NEXUS_USERNAME          - IQ Server username
  NEXUS_PASSWORD          - IQ Server password
  SBOM_FILE               - Path to the CycloneDX SBOM JSON file
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

nexus_url = os.environ["NEXUS_URL"].rstrip("/")
app_id    = os.environ["NEXUS_APP_ID"]
stage     = os.environ["NEXUS_STAGE"]
username  = os.environ["NEXUS_USERNAME"]
password  = os.environ["NEXUS_PASSWORD"]
sbom_file = os.environ["SBOM_FILE"]

auth_token = base64.b64encode(f"{username}:{password}".encode()).decode()
remediation_url = (
    f"{nexus_url}/api/v2/components/remediation/application/{app_id}"
    f"?stageId={stage}"
)

with open(sbom_file) as f:
    sbom = json.load(f)

# Map bom-ref -> purl
ref_to_purl = {
    c.get("bom-ref", ""): c.get("purl", "")
    for c in sbom.get("components", [])
    if c.get("purl")
}

# Collect unique purls affected by at least one vulnerability
affected_purls = set()
for vuln in sbom.get("vulnerabilities", []):
    for affect in vuln.get("affects", []):
        purl = ref_to_purl.get(affect.get("ref", ""), "")
        if purl:
            affected_purls.add(purl)

print(f"Fetching remediation recommendations for {len(affected_purls)} components...")


def get_recommendation(purl: str):
    """POST to Sonatype remediation API for a single component purl."""
    payload = json.dumps({"packageUrl": purl}).encode()
    req = urllib.request.Request(
        remediation_url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Basic {auth_token}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
        # Prefer next-non-failing (passes build), then next-no-violations (cleanest)
        preferred = ["next-non-failing", "next-no-violations"]
        changes = data.get("remediation", {}).get("versionChanges", [])
        by_type = {c["type"]: c for c in changes if "type" in c and "data" in c}
        for kind in preferred:
            if kind in by_type:
                rec_purl = by_type[kind]["data"].get("component", {}).get("packageUrl", "")
                if rec_purl and "@" in rec_purl:
                    rec_version = rec_purl.split("@")[1].split("?")[0]
                    return purl, f"Upgrade to version {rec_version}"
    except Exception as e:
        print(f"  Warning: remediation lookup failed for {purl}: {e}", file=sys.stderr)
    return purl, None


purl_to_recommendation: dict[str, str] = {}
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(get_recommendation, p): p for p in affected_purls}
    for future in as_completed(futures):
        purl, rec = future.result()
        if rec:
            purl_to_recommendation[purl] = rec

# Inject recommendation into each vulnerability that doesn't already have one
enriched = 0
for vuln in sbom.get("vulnerabilities", []):
    if "recommendation" not in vuln:
        for affect in vuln.get("affects", []):
            purl = ref_to_purl.get(affect.get("ref", ""), "")
            if purl in purl_to_recommendation:
                vuln["recommendation"] = purl_to_recommendation[purl]
                enriched += 1
                break

total = len(sbom.get("vulnerabilities", []))
print(f"Enriched {enriched} of {total} vulnerabilities with remediation recommendations")

with open(sbom_file, "w") as f:
    json.dump(sbom, f, indent=2)

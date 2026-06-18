"""
Syncs Sonatype IQ policy waivers to Fortify on Demand.

For each CVE that is waived in Sonatype IQ, this script:
  1. Marks the vulnerability as 'not_affected' in the CycloneDX SBOM (before FoD import)
     so FoD may auto-suppress it during import.
  2. Writes a waivers.json file listing waived (CVE ID, purl, comment) tuples so
     the calling workflow can also suppress them in FoD via fcli post-import.

Required environment variables:
  NEXUS_URL       - Base URL of the Nexus IQ Server
  NEXUS_APP_ID    - Internal application ID (UUID)
  NEXUS_STAGE     - Stage ID (e.g. "build")
  NEXUS_USERNAME  - IQ Server username
  NEXUS_PASSWORD  - IQ Server password
  SBOM_FILE       - Path to the CycloneDX SBOM JSON file (modified in place)

Output file: waivers.json
  {"waived_cves": [{"cve_id": "CVE-...", "purl": "pkg:...", "comment": "..."}]}
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.request

nexus_url = os.environ["NEXUS_URL"].rstrip("/")
app_id    = os.environ["NEXUS_APP_ID"]
stage     = os.environ["NEXUS_STAGE"]
username  = os.environ["NEXUS_USERNAME"]
password  = os.environ["NEXUS_PASSWORD"]
sbom_file = os.environ["SBOM_FILE"]

auth_token = base64.b64encode(f"{username}:{password}".encode()).decode()
auth_headers = {"Accept": "application/json", "Authorization": f"Basic {auth_token}"}


def get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers=auth_headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


# ---------------------------------------------------------------------------
# Step 1: Get the latest evaluation report ID for this application + stage
# ---------------------------------------------------------------------------
report_id = None
try:
    reports = get_json(f"{nexus_url}/api/v2/reports/applications/{app_id}")
    summaries = reports.get("applicationCompositionReportSummaries", [])
    if summaries:
        # The report HTML URL contains the scan/report ID:
        # e.g. /ui/links/application/{appId}/report/{reportId}
        html_url = summaries[0].get("reportHtmlUrl", "")
        if "/report/" in html_url:
            report_id = html_url.split("/report/")[-1].split("?")[0]
            print(f"Latest report ID: {report_id}")
except Exception as e:
    print(f"Warning: could not retrieve application reports: {e}", file=sys.stderr)

# ---------------------------------------------------------------------------
# Step 2: Get policy violations for the report and find waived ones
# ---------------------------------------------------------------------------
waived_cves: list[dict] = []

if report_id:
    try:
        policy = get_json(
            f"{nexus_url}/api/v2/applications/{app_id}/reports/{report_id}/policy"
        )
        for component in policy.get("components", []):
            purl = (
                component.get("componentIdentifier", {})
                .get("packageUrl", "")
                or component.get("packageUrl", "")
            )
            for violation in component.get("violations", []):
                if not violation.get("waived", False):
                    continue
                waiver_comment = violation.get("waiverComment", "") or "Waived in Sonatype IQ"
                # Extract CVE IDs from policy constraints
                for constraint in violation.get("constraints", []):
                    for condition in constraint.get("conditions", []):
                        value = str(
                            condition.get("conditionValue", {}).get("value", "")
                        )
                        if value.upper().startswith("CVE-"):
                            waived_cves.append(
                                {
                                    "cve_id": value.upper(),
                                    "purl": purl,
                                    "comment": waiver_comment,
                                }
                            )
        print(f"Found {len(waived_cves)} waived CVEs in Sonatype IQ report")
    except Exception as e:
        print(f"Warning: could not retrieve policy violations: {e}", file=sys.stderr)

# ---------------------------------------------------------------------------
# Step 3: Also check the SBOM for existing analysis states (belt-and-suspenders)
# ---------------------------------------------------------------------------
with open(sbom_file) as f:
    sbom = json.load(f)

ref_to_purl = {
    c.get("bom-ref", ""): c.get("purl", "")
    for c in sbom.get("components", [])
    if c.get("purl")
}

sbom_waived = 0
for vuln in sbom.get("vulnerabilities", []):
    analysis_state = vuln.get("analysis", {}).get("state", "")
    if analysis_state in ("not_affected", "false_positive", "resolved", "resolved_with_pedigree"):
        cve_id = vuln.get("id", "")
        if cve_id.upper().startswith("CVE-"):
            for affect in vuln.get("affects", []):
                purl = ref_to_purl.get(affect.get("ref", ""), "")
                if purl:
                    detail = vuln["analysis"].get("detail", f"Analysis state: {analysis_state}")
                    waived_cves.append({"cve_id": cve_id, "purl": purl, "comment": detail})
                    sbom_waived += 1
                    break

if sbom_waived:
    print(f"Found {sbom_waived} additional waived CVEs from SBOM analysis sections")

# ---------------------------------------------------------------------------
# Step 4: Inject 'not_affected' analysis state into the SBOM for waived CVEs
# so FoD may auto-suppress during import
# ---------------------------------------------------------------------------
waived_cve_ids = {entry["cve_id"] for entry in waived_cves}
enriched_count = 0

for vuln in sbom.get("vulnerabilities", []):
    cve_id = vuln.get("id", "").upper()
    if cve_id in waived_cve_ids and "analysis" not in vuln:
        comment = next(
            (e["comment"] for e in waived_cves if e["cve_id"] == cve_id),
            "Waived in Sonatype IQ",
        )
        vuln["analysis"] = {
            "state": "not_affected",
            "detail": comment,
            "responses": ["will_not_fix"],
        }
        enriched_count += 1

if enriched_count:
    print(f"Injected 'not_affected' analysis state into {enriched_count} SBOM vulnerabilities")
    with open(sbom_file, "w") as f:
        json.dump(sbom, f, indent=2)

# ---------------------------------------------------------------------------
# Step 5: Write waivers.json for use by the fcli post-import suppression step
# ---------------------------------------------------------------------------
# De-duplicate by CVE ID (keep first occurrence)
seen: set[str] = set()
unique_waivers = []
for entry in waived_cves:
    if entry["cve_id"] not in seen:
        seen.add(entry["cve_id"])
        unique_waivers.append(entry)

with open("waivers.json", "w") as f:
    json.dump({"waived_cves": unique_waivers}, f, indent=2)

print(f"Total unique waived CVEs to sync to FoD: {len(unique_waivers)}")

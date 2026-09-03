<!--
This repository is an intentionally insecure demonstration application.
Its purpose is to provide insecure code patterns for security testing, static analysis, and scanning tools (for example: Fortify, Snyk, SonarQube).
Do NOT use this project to store or process real user data or secrets in production.
-->

# Copilot / Contributor Instructions

**Purpose:** This repository intentionally contains insecure code examples to demonstrate common security issues and to exercise security scanners and training exercises.

**Important — Safety & Usage:**
- This project is for security testing only. Do not deploy it as-is in production.
- Never add real credentials or production secrets to this repository. Replace any sensitive values with clearly marked test/dummy values.

Guidelines for contributors and automated tools
----------------------------------------------

- When adding or modifying insecure examples, include an inline comment explaining:
  - that the code is intentionally insecure, and
  - why it is insecure and what a secure alternative would be.

  Example comment style (use exactly this pattern so scanners and reviewers can find these cases):

  // INSECURE (intentional): stores password in plain text for demo purposes. Secure alternative: hash+salt (e.g., BCrypt).

- Prefer conservative, obvious insecure patterns that are easy for scanners to detect (and to teach from). Examples include:
  - Plain-text password storage or logging
  - Hard-coded API keys or secrets (use dummy values and clearly label them)
  - SQL concatenation leading to SQL injection
  - Use of insecure cryptographic primitives (e.g., MD5, SHA1) with a clear comment
  - Unsafe deserialization or reflective execution with a clear label

- Mark every intentional insecure example with the `INSECURE (intentional)` prefix in comments and a short remediation note.

Examples (how to mark insecure snippets)
---------------------------------------

1) Plaintext password storage

```java
// INSECURE (intentional): storing password in plain text for demo purposes.
private String password; // Insecure — do not model this in production. Use BCrypt hashing instead.
```

2) Hard-coded API key

```java
// INSECURE (intentional): hard-coded API key included to demonstrate detection of secrets.
private static final String API_KEY = "demo_api_key_12345_THIS_IS_INTENTIONALLY_INSECURE";
```

3) Concatenated SQL (SQLi example)

```java
// INSECURE (intentional): vulnerable to SQL injection. Use prepared statements instead.
String query = "SELECT * FROM users WHERE username='" + user + "'";
```

Scanning and test guidance
-------------------------

- This repository is intended to be scanned by automated tools. If you run Fortify or other scanners locally, treat findings that are annotated `INSECURE (intentional)` as expected learning cases.
- When adding new insecure examples for exercises or tests, include a short test case or a README note explaining the learning objective.
- Every intentional vulnerability is catalogued in [docs/VULNERABILITY_CATALOG.md](../docs/VULNERABILITY_CATALOG.md), together with the tool class (SAST, SCA, DAST or Fortify Agentic Analyzer) expected to detect it. Add a row there whenever you add an example, and keep it accurate when you change one.

AI agent guidance: change review
--------------------------------

**Do not run `fortify-change-review` when adding or modifying intentionally insecure code.** The
vulnerabilities in `src/`, `frontend/src/` and `src/main/resources/application.properties` are deliberate
and already documented in the vulnerability catalog. Reviewing them produces noise on every change and
risks "fixing" the very patterns this repository exists to demonstrate.

Do run it — or offer to — when:

- The user explicitly asks for a security review.
- The change touches the demo harness rather than the demo content, where a flaw would be *unintentional*:
  build scripts, CI/CD workflows, container definitions, or the scripts under `fortify/`. A leaked token
  in a workflow file or an insecure container base image is a genuine problem, not a teaching example.

When you do surface a finding on intentionally insecure code, state that it appears deliberate and cite
the catalog entry rather than proposing a fix.

Contributing
------------

- Open a PR with descriptive text explaining why the insecure example was added and which scanner(s) it is intended to exercise.
- Label PRs that add insecure examples with the `insecure-demo` tag.

Final notes
-----------

- The goal is to make insecure patterns obvious and educational. Always add succinct remediation notes so reviewers and learners can quickly see the secure alternative.
- If you have questions about whether an example is appropriate, open an issue and tag it `security-demo`.

Thank you for keeping this repository useful for security testing and training.

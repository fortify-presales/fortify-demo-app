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

Contributing
------------

- Open a PR with descriptive text explaining why the insecure example was added and which scanner(s) it is intended to exercise.
- Label PRs that add insecure examples with the `insecure-demo` tag.

Final notes
-----------

- The goal is to make insecure patterns obvious and educational. Always add succinct remediation notes so reviewers and learners can quickly see the secure alternative.
- If you have questions about whether an example is appropriate, open an issue and tag it `security-demo`.

Thank you for keeping this repository useful for security testing and training.

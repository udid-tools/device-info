# Repository and registry setup

Review this checklist before every stable release. Bootstrap-only steps apply only when creating a
new package; keep the resulting trusted-publisher and repository controls enabled for all later
releases.

## GitHub

- Public repository: `udid-tools/device-info`.
- Enable dependency graph, Dependabot alerts, CodeQL, secret scanning, push protection, and private
  vulnerability reporting.
- Set Pages source to GitHub Actions.
- Default `GITHUB_TOKEN` permissions are read-only; release alone receives `packages: write`.
- Protect `main` with required CI/security checks, one owner/CODEOWNERS review, approval of the
  latest push, dismissal of stale approvals, signed commits, resolved conversations, linear
  history, and no force pushes or deletions. Keep both maintainers in CODEOWNERS and do not add
  ruleset bypass actors.
- Protect signed `v*` tags from update/deletion.
- Create a protected `release` environment restricted to release tags and requiring owner review.

## Free security baseline

Use GitHub's features available for public repositories: dependency graph, Dependabot alerts and
security updates, dependency review, CodeQL, provider-pattern secret scanning, push protection, and
private vulnerability reporting. JavaScript/TypeScript CodeQL combines the `security-extended`
and `security-and-quality` query suites; a separate CodeQL job scans GitHub Actions workflows.
The `Secret scanning` job runs the MIT-licensed Gitleaks CLI 8.30.1 directly, verified against a
pinned official-release SHA-256 checksum. It scans all Git refs and the tracked working tree with
upstream default rules, ignores inline bypass comments, and does not load repository allowlists.
Every invocation uses 100% redaction; scanner output is discarded and no finding reports or
artifacts are uploaded. A failed scan produces only a generic failure message. Investigate locally
with the same pinned CLI and full redaction. Keep the complete Scorecard report visible in Code
scanning.

GitHub Code Quality and paid generic-secret or enterprise security options are outside this free
baseline; do not treat a requested organization setting as proof that a paid feature is active.
CodeQL quality queries and Gitleaks provide free additional coverage without enrolling the
repository in a paid product.

Every workflow that uses npm installs the official CLI archive only after checking the committed
SHA-512 pin in `.github/npm-toolchain.json`; installation is offline with lifecycle scripts
disabled. Publishing jobs check out only this toolchain and `package.json` at the release commit,
then publish the already verified release artifact without rebuilding it.

As of 2026-11-02, GHSA-g3hv-75wg-m249 still affects TypeDoc's development-only minimatch 10
dependency. TypeDoc uses APIs removed in minimatch 11, so only the compatible ESLint consumers
use scoped overrides. npm's official CLI archive also still bundles an affected minimatch
version. Keep these upstream limitations visible and recheck official releases; do not suppress
the alerts or apply an incompatible blanket override.

## Review of npm-installer CodeQL data flows

The outbound-network and downloaded-file CodeQL recommendations identify
intentional data flows in the npm installer. The configuration contains public
package metadata, and its exact official HTTPS URL is validated before use.
Downloads reject redirects and are bounded to 32 MiB and 60 seconds. SHA-512 is
verified before the archive is written or installed; the temporary directory is
private and the archive is mode 0600. Installation runs without a shell, with
network fallback and lifecycle scripts disabled. These controls address the
reported risks; no query exclusions or inline suppressions are used.

## npm bootstrap and trusted publishing

Reserve `@udid-tools/device-info` with a minimal `0.0.0-bootstrap.0` package under the `bootstrap`
dist-tag using an interactive 2FA-protected maintainer session. Do not use `1.0.0` for bootstrap.

Configure the existing package's trusted publisher exactly:

```text
Organization: udid-tools
Repository: device-info
Workflow filename: release.yml
Environment: release
Allowed action: npm publish
```

For a new package, verify OIDC with a disposable bootstrap-tag publication before the first stable
release, then revoke bootstrap credentials and disallow traditional publish tokens. For this
existing package, confirm that the trusted publisher remains active. The public repository and
exact `repository.url` are required for provenance.

## GitHub Packages

- Publish from the repository workflow with `GITHUB_TOKEN` and `packages: write`.
- Confirm repository linkage, inherited access, and public package visibility.
- Verify registry integrity matches npm and the GitHub Release checksum.

## Copilot catalog automation

- Enable Copilot cloud agent for the repository.
- For fully automatic issue assignment, create a fine-grained personal access token owned by a
  Copilot-licensed user. Limit repository access to `udid-tools/device-info`; grant repository
  permissions `Actions`, `Contents`, `Issues`, and `Pull requests` as read/write. Metadata read
  access is added automatically. Use a short expiration and rotate the token before it expires.
- Add the token under **Settings → Secrets and variables → Actions** as the repository secret
  `COPILOT_AGENT_TOKEN`. Never place its value in a file, issue, log, or pull request.
- Verify that the repository's assignable actors include `copilot-swe-agent` before relying on the
  scheduled workflow. The REST issue-assignment API requires a user token; `GITHUB_TOKEN` is an
  installation token and cannot replace this secret.
- The token must not be available to pull request jobs or release jobs.
- Create labels: `bug`, `catalog`, `catalog-update`, `device`, `device-family`, `documentation`,
  `enhancement`, `os-version`, `security`, `dependencies`, `javascript`, `github-actions`,
  `breaking-change`, and `skip-changelog`.

Before every stable release, confirm that CI, pack/consumer rehearsal, npm OIDC provenance, GitHub
Packages, signed-tag rules, Sigstore asset signing, and release-environment review are complete.

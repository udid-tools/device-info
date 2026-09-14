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
- Protect `main` with required CI/security checks, one owner/CODEOWNERS review, resolved
  conversations, linear history, and no force pushes.
- Protect signed `v*` tags from update/deletion.
- Create a protected `release` environment restricted to release tags and requiring owner review.

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

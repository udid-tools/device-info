# Repository and registry setup

Complete this checklist before creating `v1.0.0`.

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

Verify OIDC with a disposable bootstrap-tag publication before creating `v1.0.0`, then revoke
bootstrap credentials and disallow traditional publish tokens. The public repository and exact
`repository.url` are required for provenance.

## GitHub Packages

- Publish from the repository workflow with `GITHUB_TOKEN` and `packages: write`.
- Confirm repository linkage, inherited access, and public package visibility.
- Verify registry integrity matches npm and the GitHub Release checksum.

## Copilot catalog automation

- Enable Copilot cloud agent for the repository.
- Add a narrowly scoped `COPILOT_AGENT_TOKEN` only if fully automatic issue assignment is desired.
- The token must not be available to pull request jobs or release jobs.
- Create labels: `bug`, `catalog`, `catalog-update`, `device`, `device-family`, `documentation`,
  `enhancement`, `os-version`, `security`, `dependencies`, `javascript`, `github-actions`,
  `breaking-change`, and `skip-changelog`.

Do not create `v1.0.0` until CI, pack/consumer rehearsal, npm bootstrap/OIDC, GitHub Packages, tag
rules, and release environment checks are complete.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-03-09

### Added

- Multi-entry batch encrypt/decrypt — add multiple labeled entries and process all with a single password
- YAML import/export — import a `vault.yml` file for bulk decryption; export encrypted results as `vault.yml`
- `encryptMultiple` and `decryptMultiple` server actions with per-entry result reporting
- YAML utility (`lib/vault/yaml.ts`) with `parseVaultYaml` and `generateVaultYaml` helpers

### Changed

- Upgrade Next.js from 16.1.1 to 16.1.5
- Encrypt/decrypt forms refactored to support both single and multi-entry modes

### Fixed

- Cursor pointer CSS now applied consistently to all button elements
- LICENSE link updated to use `master` branch

### Security

- Bump minimatch from 3.1.2 to 3.1.5 and 9.0.5 to 9.0.9 (indirect dependency)

## [1.1.1] - 2026-03-01

### Security

- Fix style Content Security Policy to allow inline styles required by theme provider

## [1.1.0] - 2026-01-28

### Security

- Improve security headers (CSP, HSTS, X-Frame-Options, etc.) via `next.config.ts` and `proxy.ts`

## [1.0.1] - 2026-01-07

### Fixed

- UI layout and styling improvements

## [1.0.0] - 2026-01-02

### Added

- Ansible Vault encryption - encrypt plain text strings into Ansible vault format
- Ansible Vault decryption - decrypt Ansible vault-encrypted strings back to plain text
- Modern UI/UX with clean, intuitive interface built with Next.js and shadcn/ui
- Dark mode support with automatic theme detection and manual toggle
- Server-side processing for all encryption/decryption operations
- Input validation using Zod schemas
- One-click copy to clipboard functionality for results
- Toast notifications for user-friendly feedback
- Responsive mobile-first design
- Stateless architecture with no data persistence
- Self-hosted deployment documentation
- GitHub Actions CI/CD pipeline with lint, type-check, tests, and build
- Release workflow with Docker image publishing to Docker Hub

[Unreleased]: https://github.com/pedrordgs/vaulthub/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/pedrordgs/vaulthub/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/pedrordgs/vaulthub/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/pedrordgs/vaulthub/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/pedrordgs/vaulthub/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/pedrordgs/vaulthub/releases/tag/v1.0.0

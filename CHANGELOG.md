# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog (https://keepachangelog.com/en/1.1.0/),
and this project adheres to Semantic Versioning (https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-10-16

Recommended SemVer bump: PATCH

### Fixed
- Fix variable error. ([a693f85](https://github.com/in-RET/ensys-gui-new/commit/a693f85))
- Fix scenario "no data" handling (#125). ([327e548](https://github.com/in-RET/ensys-gui-new/commit/327e548), PR [#128](https://github.com/in-RET/ensys-gui-new/pull/128))

### Performance
- Backend: Enable ORJSONResponse as default FastAPI response for faster JSON serialization.
- Backend: Add GZipMiddleware to compress large responses (>= 1KB) and reduce bandwidth.
- Frontend: Ensure scenario model types use TypeScript interfaces (no emitted JS) to minimize bundle size.


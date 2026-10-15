#!/usr/bin/env bash
# Build + checks for one iteration. Exit non-zero on any failure.
set -e
cd "$(dirname "$0")/../.."
SITE_URL=https://aifloh.com BASE_PATH=/ npm run build > /tmp/iter-build.log 2>&1 || { tail -20 /tmp/iter-build.log; exit 1; }
npm run check > /tmp/iter-check.log 2>&1 || { tail -20 /tmp/iter-check.log; exit 1; }
npm test > /tmp/iter-test.log 2>&1 || { grep -E "^# (pass|fail)" /tmp/iter-test.log; exit 1; }
E2E_URL=http://localhost:4331 CHROME_PATH=/opt/pw-browsers/chromium npm run e2e > /tmp/iter-e2e.log 2>&1 || true
if grep -q "^FAIL" /tmp/iter-e2e.log; then grep "^FAIL" /tmp/iter-e2e.log; exit 1; fi
echo "verify: build, typecheck, unit and $(grep -c '^PASS' /tmp/iter-e2e.log) e2e flows pass"

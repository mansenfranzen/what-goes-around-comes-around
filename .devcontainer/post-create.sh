#!/usr/bin/env bash
set -euo pipefail

# Chrome on Linux ignores the system CA store and reads the user's NSS database instead.
NSSDB="sql:$HOME/.pki/nssdb"
mkdir -p "$HOME/.pki/nssdb"
certutil -d "$NSSDB" -L >/dev/null 2>&1 || certutil -d "$NSSDB" -N --empty-password
for cert in /usr/local/share/ca-certificates/*.crt; do
  [ -e "$cert" ] || continue
  certutil -d "$NSSDB" -A -t "C,," -n "$(basename "$cert" .crt)" -i "$cert"
done

npm install -g @playwright/mcp@0.0.85
"$(npm root -g)/@playwright/mcp/node_modules/.bin/playwright" install --with-deps chromium

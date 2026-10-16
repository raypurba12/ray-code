#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG="$HOME/raycode-deploy.log"
LOCK="$HOME/.raycode-deploy.lock"

for d in /usr/local/bin "$HOME"/nodevenv/*/*/bin "$HOME"/nodevenv/*/bin /opt/cpanel/ea-php*/root/usr/bin "$HOME"/bin; do
  if [ -d "$d" ]; then
    PATH="$d:$PATH"
  fi
done
export PATH

if ! command -v git >/dev/null 2>&1 || ! command -v php >/dev/null 2>&1; then
  echo "$(date '+%F %T') ERROR: git/php tidak ketemu di PATH cron (git: $(command -v git || echo -), php: $(command -v php || echo -))" >> "$LOG"
  exit 1
fi

if ! mkdir "$LOCK" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

cd "$REPO_DIR"

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
  echo "$(date '+%F %T') ERROR: repo dalam keadaan detached HEAD" >> "$LOG"
  exit 1
fi

git fetch origin --quiet || exit 0

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo "")"

if [ -z "$REMOTE" ]; then
  exit 0
fi

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

{
  echo ""
  echo "=== $(date '+%F %T') DEPLOY $BRANCH: $LOCAL -> $REMOTE"
  bash deploy.sh
} >> "$LOG" 2>&1

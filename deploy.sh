#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/5 Pull kode terbaru (termasuk build frontend)"
git pull --ff-only

echo "==> 2/5 Sinkronkan aset build ke folder publik"
PUBLIC_HTML_DIR="${PUBLIC_HTML_DIR:-$HOME/public_html}"
if [ ! -f public/build/manifest.json ]; then
  echo "ERROR: public/build/manifest.json tidak ditemukan. Deploy dibatalkan." >&2
  exit 1
fi
mkdir -p "$PUBLIC_HTML_DIR/build/assets"
cp -an public/build/assets/. "$PUBLIC_HTML_DIR/build/assets/"
cp -f public/build/manifest.json "$PUBLIC_HTML_DIR/build/manifest.json"

echo "==> 3/5 Hapus sisa dev-server (kalau ada)"
rm -f public/hot

echo "==> 4/5 Migrasi database"
php artisan migrate --force

echo "==> 5/5 Bersihkan cache"
php artisan optimize:clear

echo ""
echo "==> SELESAI. Buka https://raycode.my.id lalu hard refresh (Ctrl+Shift+R)"

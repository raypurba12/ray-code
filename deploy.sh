#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/4 Pull kode terbaru (termasuk build frontend)"
git pull --ff-only

echo "==> 2/4 Hapus sisa dev-server (kalau ada)"
rm -f public/hot

echo "==> 3/4 Migrasi database"
php artisan migrate --force

echo "==> 4/4 Bersihkan cache"
php artisan optimize:clear

echo ""
echo "==> SELESAI. Buka https://raycode.my.id lalu hard refresh (Ctrl+Shift+R)"

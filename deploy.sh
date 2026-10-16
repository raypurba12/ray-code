#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/6 Pull kode terbaru"
git pull --ff-only

echo "==> 2/6 Install dependency frontend"
npm install --no-audit --no-fund

echo "==> 3/6 Build aset frontend"
npm run build

echo "==> 4/6 Hapus sisa dev-server (kalau ada)"
rm -f public/hot

echo "==> 5/6 Migrasi database"
php artisan migrate --force

echo "==> 6/6 Bersihkan cache"
php artisan optimize:clear

echo ""
echo "==> SELESAI. Buka https://raycode.my.id lalu hard refresh (Ctrl+Shift+R)"

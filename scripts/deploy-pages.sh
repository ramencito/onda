#!/usr/bin/env bash
# Publica una nueva versión de Onda en GitHub Pages.
# Uso: ./scripts/deploy-pages.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Build de producción..."
npm run build

echo "▶ Subiendo a la rama gh-pages..."
STAGE="$(mktemp -d)"
cp -r dist/. "$STAGE/"
cd "$STAGE"
git init -q -b gh-pages
git add .
git -c user.name="Ramses_Luna" -c user.email="ramseslopez5969@gmail.com" \
    commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
git remote add origin https://github.com/ramencito/onda.git
git push -q -f origin gh-pages
rm -rf "$STAGE"

echo "✓ Publicado: https://ramencito.github.io/onda/ (se actualiza en ~30-60 s)"

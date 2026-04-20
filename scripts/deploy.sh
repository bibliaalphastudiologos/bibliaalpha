#!/usr/bin/env bash
# ============================================================
#  BíbliaAlpha — Deploy Script (Firebase CLI)
#  Uso: bash scripts/deploy.sh
#  Requer: Node 20+, firebase-tools instalado globalmente
#    npm install -g firebase-tools
#    firebase login
# ============================================================
set -e

echo "🔨 Limpando build anterior..."
rm -rf dist

echo "📦 Instalando dependências..."
npm ci

echo "🏗️  Fazendo build de produção..."
npm run build

echo "🚀 Deploy para Firebase Hosting..."
firebase deploy --only hosting --project sentinela-ai-489015

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Site: https://sentinela-ai-489015.web.app"
echo "🌐 Site: https://bibliaalpha.com.br (se domínio configurado)"

#!/bin/bash

# Script master para iniciar BACKEND + FRONTEND juntos com monitoramento automático
# Ambos serão reiniciados automaticamente se caírem

set -e

PROJECT_DIR="/Users/andersonvieira/Documents/lovable-crm"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ 🚀 LOVABLE CRM - INICIALIZAÇÃO DO SISTEMA                  ║"
echo "║ Backend + Frontend com Auto-Restart                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Backend:  $BACKEND_DIR"
echo "📍 Frontend: $FRONTEND_DIR"
echo ""

# Kill any existing processes
echo "🛑 Parando processos anteriores..."
pkill -f "uvicorn app.main" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "▶️  INICIANDO BACKEND (porta 8000)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
chmod +x "$BACKEND_DIR/start-backend.sh"
"$BACKEND_DIR/start-backend.sh" &
BACKEND_MONITOR_PID=$!
echo "✅ Backend monitor iniciado (PID: $BACKEND_MONITOR_PID)"
sleep 2

# Start frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "▶️  INICIANDO FRONTEND (porta 3000)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
chmod +x "$FRONTEND_DIR/start-frontend.sh"
"$FRONTEND_DIR/start-frontend.sh" &
FRONTEND_MONITOR_PID=$!
echo "✅ Frontend monitor iniciado (PID: $FRONTEND_MONITOR_PID)"
sleep 3

# Verify both are running
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SISTEMA PRONTO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   Health:    http://localhost:8000/health"
echo ""
echo "📊 Status:"

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Backend: RODANDO (porta 8000)"
else
    echo "   ❌ Backend: PROBLEMA (aguarde um momento)"
fi

# Check frontend
if curl -s -I http://localhost:3000 2>/dev/null | grep -q "200\|301\|302"; then
    echo "   ✅ Frontend: RODANDO (porta 3000)"
else
    echo "   ❌ Frontend: PROBLEMA (aguarde um momento)"
fi

echo ""
echo "📋 Logs:"
echo "   Backend:  /tmp/lovable-backend.log ou /tmp/backend-*.log"
echo "   Frontend: /tmp/lovable-frontend.log ou /tmp/frontend-*.log"
echo ""
echo "⚙️  Processos:"
echo "   Backend Monitor:  PID $BACKEND_MONITOR_PID"
echo "   Frontend Monitor: PID $FRONTEND_MONITOR_PID"
echo ""
echo "🛑 Para PARAR completamente:"
echo "   kill $BACKEND_MONITOR_PID $FRONTEND_MONITOR_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Sistema com AUTO-RESTART ativado!"
echo "Se qualquer serviço cair, será reiniciado automaticamente."
echo ""

#!/bin/bash

# Script para iniciar e manter o frontend rodando permanentemente
# Este script reinicia automaticamente o frontend se ele cair

FRONTEND_DIR="/Users/andersonvieira/Documents/lovable-crm/frontend"
PORT=3000
LOG_FILE="/tmp/frontend-$(date +%Y%m%d-%H%M%S).log"

cd "$FRONTEND_DIR" || exit 1

echo "🚀 Frontend startup iniciado em $(date)" | tee "$LOG_FILE"
echo "📝 Log: $LOG_FILE"
echo "🔌 Port: $PORT"

# Função para iniciar o frontend
start_frontend() {
    echo "Starting frontend at $(date)..." | tee -a "$LOG_FILE"
    nohup npm run dev -- -p $PORT >> "$LOG_FILE" 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID" | tee -a "$LOG_FILE"
    echo $FRONTEND_PID > /tmp/lovable-frontend.pid
}

# Função para verificar se o frontend está rodando
check_frontend() {
    if [ -f /tmp/lovable-frontend.pid ]; then
        PID=$(cat /tmp/lovable-frontend.pid)
        if kill -0 $PID 2>/dev/null; then
            return 0  # Rodando
        else
            return 1  # Não está rodando
        fi
    else
        return 1  # PID file não existe
    fi
}

# Iniciar o frontend na primeira vez
start_frontend

# Loop infinito para monitorar e reiniciar se necessário
echo "✅ Monitoramento iniciado. O frontend será reiniciado automaticamente se cair."
echo "💡 Para parar: kill $(cat /tmp/lovable-frontend.pid)"

while true; do
    sleep 10  # Verifica a cada 10 segundos

    if ! check_frontend; then
        echo "⚠️  Frontend caiu! Reiniciando em $(date)..." | tee -a "$LOG_FILE"
        start_frontend
        echo "🔄 Frontend reiniciado (PID: $FRONTEND_PID)" | tee -a "$LOG_FILE"
    fi
done

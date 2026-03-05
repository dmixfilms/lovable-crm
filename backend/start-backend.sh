#!/bin/bash

# Script para iniciar e manter o backend rodando permanentemente
# Este script reinicia automaticamente o backend se ele cair

BACKEND_DIR="/Users/andersonvieira/Documents/lovable-crm/backend"
VENV_PYTHON="$BACKEND_DIR/.venv/bin/python"
PORT=8000
LOG_FILE="/tmp/backend-$(date +%Y%m%d-%H%M%S).log"

cd "$BACKEND_DIR" || exit 1

echo "🚀 Backend startup iniciado em $(date)" | tee "$LOG_FILE"
echo "📝 Log: $LOG_FILE"
echo "🔌 Port: $PORT"

# Função para iniciar o backend
start_backend() {
    echo "Starting backend at $(date)..." | tee -a "$LOG_FILE"
    nohup "$VENV_PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port $PORT >> "$LOG_FILE" 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID" | tee -a "$LOG_FILE"
    echo $BACKEND_PID > /tmp/lovable-backend.pid
}

# Função para verificar se o backend está rodando
check_backend() {
    if [ -f /tmp/lovable-backend.pid ]; then
        PID=$(cat /tmp/lovable-backend.pid)
        if kill -0 $PID 2>/dev/null; then
            return 0  # Rodando
        else
            return 1  # Não está rodando
        fi
    else
        return 1  # PID file não existe
    fi
}

# Iniciar o backend na primeira vez
start_backend

# Loop infinito para monitorar e reiniciar se necessário
echo "✅ Monitoramento iniciado. O backend será reiniciado automaticamente se cair."
echo "💡 Para parar: kill $(cat /tmp/lovable-backend.pid)"

while true; do
    sleep 10  # Verifica a cada 10 segundos

    if ! check_backend; then
        echo "⚠️  Backend caiu! Reiniciando em $(date)..." | tee -a "$LOG_FILE"
        start_backend
        echo "🔄 Backend reiniciado (PID: $BACKEND_PID)" | tee -a "$LOG_FILE"
    fi
done

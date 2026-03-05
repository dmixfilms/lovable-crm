# 🚀 Inicialização do Sistema Lovable CRM

## ⚡ Quick Start (Recomendado)

Para iniciar **TUDO** com auto-restart automático:

```bash
/Users/andersonvieira/Documents/lovable-crm/start-all.sh
```

Isso inicia:
- ✅ Backend FastAPI (porta 8000) com auto-restart
- ✅ Frontend Next.js (porta 3000) com auto-restart

## 🔧 Inicialização Individual

Se preferir iniciar separadamente:

### Backend
```bash
/Users/andersonvieira/Documents/lovable-crm/backend/start-backend.sh
```
- Porta: 8000
- Log: `/tmp/backend-*.log`
- Auto-restart: ✅ SIM (verifica a cada 10s)

### Frontend
```bash
/Users/andersonvieira/Documents/lovable-crm/frontend/start-frontend.sh
```
- Porta: 3000
- Log: `/tmp/frontend-*.log`
- Auto-restart: ✅ SIM (verifica a cada 10s)

## 🌐 URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Health Check | http://localhost:8000/health |

## 📊 Monitoramento

### Ver status dos processos
```bash
ps aux | grep -E "start-backend|start-frontend|uvicorn"
```

### Ver logs em tempo real
```bash
# Backend
tail -f /tmp/backend-*.log

# Frontend
tail -f /tmp/frontend-*.log
```

### PIDs dos processos
```bash
# Backend PID
cat /tmp/lovable-backend.pid

# Frontend PID
cat /tmp/lovable-frontend.pid
```

## 🛑 Parar o Sistema

### Parar tudo
```bash
pkill -f "start-backend\|start-frontend"
```

### Parar apenas backend
```bash
kill $(cat /tmp/lovable-backend.pid)
```

### Parar apenas frontend
```bash
kill $(cat /tmp/lovable-frontend.pid)
```

## ⚙️ Como Funciona o Auto-Restart

1. Cada script inicia um **monitor** que verifica a cada 10 segundos
2. Se o processo cair, o monitor o reinicia automaticamente
3. O log é mantido em `/tmp/` com timestamps
4. Não há perda de dados (banco SQLite persiste)

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar logs
tail -f /tmp/backend-*.log

# Verificar se porta 8000 está livre
lsof -i :8000

# Manualmente (debugging)
cd /Users/andersonvieira/Documents/lovable-crm/backend
/Users/andersonvieira/Documents/lovable-crm/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend não inicia
```bash
# Verificar logs
tail -f /tmp/frontend-*.log

# Verificar se porta 3000 está livre
lsof -i :3000

# Manualmente (debugging)
cd /Users/andersonvieira/Documents/lovable-crm/frontend
npm run dev
```

### Ambos caem repetidamente
1. Verifique os logs para erros reais
2. Verifique se há erros no banco de dados: `sqlite3 lovable_crm.db`.
3. Teste manualmente antes de usar auto-restart
4. Reinicie a máquina se necessário

## 💡 Dicas

- **Auto-restart é automático**: Não precisa fazer nada manualmente
- **Logs crescem**: Considere limpar `/tmp/` periodicamente (`rm /tmp/backend-*.log /tmp/frontend-*.log`)
- **Permissões**: Scripts têm chmod +x para execução
- **Virtualenv**: Backend usa `.venv` local para isolamento

## 📈 Próximas Melhorias

Para um sistema 100% robusto em produção, considere:
- `supervisord` para gerenciamento mais avançado
- systemd services (Linux)
- Docker para containerização
- Load balancer (nginx) em frente

---

**Sistema configurado com auto-restart em 28/Feb/2026** ✅

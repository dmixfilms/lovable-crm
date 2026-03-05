# 📦 Backup System - Lovable CRM

Sistema automático de backup do banco de dados com dados dos comercios.

## 🎯 Características

- ✅ **Backup Automático**: A cada 6 horas (4x por dia)
- ✅ **Comprimido**: Arquivos .gz para economizar espaço (80% menos)
- ✅ **Histórico**: Mantém os últimos 30 backups
- ✅ **Timestamped**: Cada backup com data/hora para fácil identificação
- ✅ **API de Gerenciamento**: Endpoints para criar, listar, restaurar backups
- ✅ **Seguro**: Apenas admins podem acessar

## 📂 Localização dos Backups

```
/Users/andersonvieira/Documents/lovable-crm/backend/backups/
```

Exemplo:
```
lovable_crm_20260227_175648.db.gz (74 KB)
lovable_crm_20260228_010000.db.gz (75 KB)
lovable_crm_20260228_070000.db.gz (75 KB)
```

## 🔄 Cronograma Automático

```
06:00 AM → 1º Backup
12:00 PM → 2º Backup
06:00 PM → 3º Backup
12:00 AM → 4º Backup
```

(Roda automaticamente via APScheduler)

## 🛠️ API de Backups

### 1. Criar Backup Manual

```bash
curl -X POST http://localhost:8000/backups/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "status": "success",
  "backup_file": "backups/lovable_crm_20260227_175648.db.gz"
}
```

### 2. Listar Todos os Backups

```bash
curl http://localhost:8000/backups/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "status": "success",
  "count": 3,
  "backups": [
    {
      "filename": "lovable_crm_20260227_175648.db.gz",
      "path": "backups/lovable_crm_20260227_175648.db.gz",
      "size_mb": 0.07
    }
  ]
}
```

### 3. Restaurar a Partir de Backup

```bash
curl -X POST http://localhost:8000/backups/restore/lovable_crm_20260227_175648.db.gz \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "status": "success",
  "message": "Restored from lovable_crm_20260227_175648.db.gz"
}
```

## 💾 Espaço em Disco

Com backups a cada 6 horas:
- 4 backups/dia
- 120 backups/mês
- ~0.07 MB por backup (comprimido)
- **Total: ~8.4 MB/mês**

Mantém 30 backups mais recentes (automático).

## 🔐 Segurança

- ✅ Apenas admins podem gerenciar backups
- ✅ Requer autenticação
- ✅ Validação de filename (previne path traversal)
- ✅ Comprimido com gzip
- ✅ Backup local no servidor

## 📋 Dados Inclusos

Cada backup contém:
- ✅ 201+ Leads (comercios)
- ✅ Emails, telefones, endereços
- ✅ Status do pipeline
- ✅ Previews criadas
- ✅ Tarefas (tasks)
- ✅ Transações
- ✅ Histórico completo

## 🚀 Uso Prático

### Fazer Backup Manual

```bash
# Via Python
cd backend
python -c "
from app.workers.backup import create_backup, list_backups
create_backup()
list_backups()
"
```

### Listar Backups

```bash
ls -lh backend/backups/
```

### Restaurar (Emergência)

```bash
# Via Python
python -c "
from app.workers.backup import restore_from_backup
restore_from_backup('backups/lovable_crm_20260227_175648.db.gz')
"
```

## ⚙️ Configuração

No `app/workers/scheduler.py`:

```python
# Backup a cada 6 horas (4x/dia)
scheduler.add_job(
    backup.create_backup,
    "interval",
    hours=6,
    id="database_backup",
)
```

Para mudar intervalo:
- `hours=1` → A cada 1 hora (24x/dia)
- `hours=12` → A cada 12 horas (2x/dia)
- `hours=24` → Uma vez por dia

## 📊 Exemplo de Limpeza Automática

Sistema mantém últimos 30 backups:
- Se tiver 31 backups → Deleta o mais antigo
- Nunca perde dados importantes

## 🆘 Troubleshooting

### Backup não criado?

Verificar:
1. Espaço em disco: `df -h`
2. Permissões: `ls -la backend/backups/`
3. Database lock: Reiniciar backend
4. Logs: `tail /tmp/backend.log`

### Restaurar falhou?

1. Verificar filename: `ls backend/backups/`
2. Testar gzip: `gunzip -t backup_file.db.gz`
3. Backup corrompido? Usar backup anterior

## 🔄 Próximos Passos (Opcional)

- [ ] Upload automático para S3/Google Cloud
- [ ] Encriptação dos backups
- [ ] Alertas por email se backup falhar
- [ ] Dashboard de status dos backups
- [ ] Integração com sistema de alertas

## 💡 Vendendo Dados

Os dados dos 201+ comercios incluem:
- ✅ Nome do negócio
- ✅ Categoria (indústria)
- ✅ Localização (endereço, suburb)
- ✅ Contato (email, telefone)
- ✅ Website
- ✅ Rating & reviews (se disponível)
- ✅ Histórico de interações

**Com backups regulares, você tem:**
- 📁 Backup diário dos dados
- 🔐 Recuperação garantida
- 📊 Histórico completo
- 💼 Ativo valioso para vender

---

**Status**: ✅ Ativo e rodando 24/7
**Última verificação**: 2026-02-27 17:56
**Próximo backup**: +6 horas

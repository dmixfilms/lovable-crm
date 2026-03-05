#!/bin/bash

# Backup Management Script for Lovable CRM
# Usage: ./backup.sh [create|list|restore|size|clean]

cd "$(dirname "$0")/backend"

case "$1" in
  create)
    echo "📦 Criando backup..."
    /Users/andersonvieira/Documents/lovable-crm/backend/venv/bin/python -c "
from app.workers.backup import create_backup
backup_file = create_backup()
if backup_file:
  print('\n✅ Backup criado com sucesso!')
  print(f'Arquivo: {backup_file}')
else:
  print('❌ Erro ao criar backup')
  exit(1)
"
    ;;

  list)
    echo "📂 Backups disponíveis:"
    /Users/andersonvieira/Documents/lovable-crm/backend/venv/bin/python -c "
from app.workers.backup import list_backups
list_backups()
"
    ;;

  restore)
    if [ -z "$2" ]; then
      echo "❌ Especifique o arquivo para restaurar"
      echo "Uso: ./backup.sh restore lovable_crm_20260227_175648.db.gz"
      echo ""
      echo "Arquivos disponíveis:"
      ls -1 backups/*.db.gz 2>/dev/null | xargs -n1 basename
      exit 1
    fi

    echo "⚠️  Restaurando de $2..."
    echo "⚠️  Isto vai sobrescrever o banco de dados atual!"
    read -p "Tem certeza? (sim/não): " confirm

    if [ "$confirm" != "sim" ]; then
      echo "Cancelado"
      exit 0
    fi

    /Users/andersonvieira/Documents/lovable-crm/backend/venv/bin/python -c "
from app.workers.backup import restore_from_backup
from pathlib import Path

backup_file = Path('backups') / '$2'
if not backup_file.exists():
  print('❌ Arquivo não encontrado: $2')
  exit(1)

if restore_from_backup(str(backup_file)):
  print('✅ Restauração concluída!')
else:
  print('❌ Erro ao restaurar')
  exit(1)
"
    ;;

  size)
    echo "📊 Tamanho dos backups:"
    du -sh backups/ 2>/dev/null || echo "❌ Nenhum backup encontrado"
    echo ""
    echo "Detalhes:"
    ls -lh backups/*.db.gz 2>/dev/null | awk '{printf "%s (%s)\n", $9, $5}' | sed 's|backups/||g'
    ;;

  clean)
    echo "🗑️  Limpando backups antigos..."
    echo "⚠️  Mantendo os 30 mais recentes..."
    /Users/andersonvieira/Documents/lovable-crm/backend/venv/bin/python -c "
from app.workers.backup import cleanup_old_backups
from pathlib import Path
cleanup_old_backups(Path('backups'), keep_count=30)
print('✅ Limpeza concluída!')
"
    ;;

  *)
    echo "🎯 Backup Management Script"
    echo ""
    echo "Uso: ./backup.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  create   - Criar backup manual"
    echo "  list     - Listar todos os backups"
    echo "  restore  - Restaurar de um backup"
    echo "  size     - Ver tamanho dos backups"
    echo "  clean    - Limpar backups antigos"
    echo ""
    echo "Exemplos:"
    echo "  ./backup.sh create"
    echo "  ./backup.sh list"
    echo "  ./backup.sh size"
    echo "  ./backup.sh restore lovable_crm_20260227_175648.db.gz"
    echo "  ./backup.sh clean"
    ;;
esac

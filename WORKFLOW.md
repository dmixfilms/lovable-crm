# Lovable CRM - Git Workflow

## ✅ Repositório GitHub criado!

**URL:** https://github.com/dmixfilms/lovable-crm

---

## 📋 Como trabalhar daqui em diante

### 1. Fazer mudanças no código

```bash
# Edite os arquivos normalmente
# Por exemplo: adicionar feature, corrigir bug, etc
```

### 2. Ver o que mudou

```bash
git status
```

### 3. Adicionar mudanças ao commit

```bash
# Adicionar arquivos específicos
git add arquivo1.ts arquivo2.py

# OU adicionar tudo
git add .
```

### 4. Fazer o commit

```bash
git commit -m "Descrição clara da mudança"
```

**Exemplos de boas mensagens:**

```bash
# Feature nova
git commit -m "feat: Add payment link generation feature"

# Correção de bug
git commit -m "fix: Resolve login authentication error"

# Documentação
git commit -m "docs: Update README with installation steps"

# Refatoração
git commit -m "refactor: Simplify lead filtering logic"

# Melhoria de performance
git commit -m "perf: Optimize database queries for leads list"
```

### 5. Enviar para GitHub

```bash
git push
```

---

## 🚀 Exemplos completos

### Exemplo 1: Adicionar uma feature

```bash
# 1. Editar arquivos...

# 2. Ver mudanças
git status

# 3. Adicionar tudo
git add .

# 4. Commit
git commit -m "feat: Add email notifications for deal status changes"

# 5. Push
git push
```

### Exemplo 2: Corrigir um bug

```bash
# 1. Corrigir o arquivo...

# 2. Adicionar apenas o arquivo corrigido
git add frontend/src/hooks/usePayment.ts

# 3. Commit específico
git commit -m "fix: Handle Stripe payment link errors gracefully"

# 4. Push
git push
```

---

## 📊 Ver histórico

```bash
# Ver últimos commits
git log --oneline -10

# Ver detalhes de um commit
git show COMMIT_ID

# Ver mudanças não commitadas
git diff

# Ver mudanças staged
git diff --staged
```

---

## ⚠️ IMPORTANTE - Nunca fazer:

❌ **NUNCA deletar banco de dados sem commit**
```bash
# ERRADO - nunca faça isso:
rm lovable_crm.db
```

✅ **SEMPRE commit antes de mudanças importantes**
```bash
# CORRETO:
git add .
git commit -m "docs: Backup database before schema changes"
# [depois delete/modifique]
```

---

## 🔄 Fluxo típico de desenvolvimento

```
1. git status                    # Ver o que mudou
2. git add .                     # Preparar mudanças
3. git commit -m "descrição"     # Criar snapshot
4. git push                      # Enviar para GitHub
5. Verificar em: https://github.com/dmixfilms/lovable-crm
```

---

## 💡 Dicas úteis

### Desfazer mudanças não commitadas
```bash
git checkout .
```

### Desfazer último commit (antes de push)
```bash
git reset --soft HEAD~1
```

### Ver o que foi adicionado
```bash
git add -p
```

### Criar branch para feature
```bash
git checkout -b feature/payment-improvements
# [fazer mudanças...]
git push -u origin feature/payment-improvements
# Depois fazer Pull Request no GitHub
```

---

## 🎯 Resumo rápido

```bash
# A seqüência que você vai usar 90% das vezes:
git add .
git commit -m "description"
git push
```

Fim! Agora seu código está seguro no GitHub! 🔐

# 🚀 QUICK START - Agent WebDesign

**Comece AGORA em 5 minutos!**

---

## 🎯 O que você tem agora

✅ **Website Dumpling Room** - Completo e funcional
✅ **3 Scripts de Download** - Para pegar as imagens
✅ **Documentação** - Tudo documentado

---

## 🏃 5 MINUTOS PARA COMEÇAR

### Passo 1: Abrir o website (30 segundos)
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/index.html
```

Pronto! Seu website está online! 🎉

### Passo 2: Baixar imagens (2 minutos)
```bash
# Instalar dependências (primeira vez)
pip3 install selenium
brew install chromedriver

# Executar download
cd ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room
python3 scripts/download_dumpling_images.py
```

As imagens vão aparecer em: `./images/`

### Passo 3: Visualizar imagens (1 minuto)
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/images/
```

### Passo 4: Servidor local (para testes) (1 minuto)
```bash
cd ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website
python3 -m http.server 8080
# Abra: http://localhost:8080
```

---

## 📁 Arquivos Principais

| Arquivo | O quê | Onde |
|---------|-------|------|
| **index.html** | Estrutura do site | `website/` |
| **styles.css** | Design e cores | `website/` |
| **app.js** | Interatividade | `website/` |
| **images/** | Fotos do restaurante | `images/` |
| **README.md** | Info do restaurante | raiz |

---

## 🆘 Precisa de Ajuda?

### ❓ Website não abre?
```bash
# Tente abrir assim:
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/index.html
```

### ❓ Scripts não funcionam?
```bash
# Verifique Python
python3 --version

# Instale dependências
pip3 install selenium requests
brew install chromedriver
```

### ❓ Quer fazer outro site?
1. Crie pasta: `mkdir -p ~/Documents/lovable-crm/agent-webdesign/NOVO-LEAD/{images,website,documents,scripts}`
2. Copie scripts: `cp ~/Documents/lovable-crm/agent-webdesign/scripts/* NOVO-LEAD/scripts/`
3. Pesquise o lead
4. Crie o website
5. Baixe imagens

---

## 📚 Documentação Completa

Se quiser entender melhor:

- **README.md** - Guia geral
- **INDEX.md** - Índice centralizado
- **GUIA_DOWNLOAD_IMAGENS.md** - Só sobre imagens
- **Dumpling-Room/README.md** - Info do restaurante

---

## 🎨 Personalizar Website

Edite os arquivos em `website/`:

**Mudar cores:**
- Abra `styles.css`
- Procure por `--color-primary`, `--color-accent`
- Mude para suas cores

**Mudar textos:**
- Abra `index.html`
- Procure pelo texto
- Mude para o que quiser

**Adicionar seções:**
- Copie uma seção inteira
- Cole em outro lugar
- Mude o conteúdo

---

## 📊 Próximos Leads

Quer criar website para outro restaurante/negócio?

### Opção 1: Buscar no CRM
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db
SELECT business_name FROM leads LIMIT 10;
```

### Opção 2: Criar nova pasta
```bash
mkdir -p ~/Documents/lovable-crm/agent-webdesign/Novo-Restaurante/{images,website,documents,scripts}
```

### Opção 3: Copiar scripts
```bash
cp ~/Documents/lovable-crm/agent-webdesign/scripts/* \
   ~/Documents/lovable-crm/agent-webdesign/Novo-Restaurante/scripts/
```

---

## 💾 Salvar Backup

```bash
# Fazer backup do Dumpling Room
tar -czf ~/backup_dumpling_room_$(date +%Y%m%d).tar.gz \
  ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/
```

---

## 🔗 Links Úteis

- **Website aberto:** `open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/index.html`
- **Imagens:** `open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/images/`
- **Scripts:** `open ~/Documents/lovable-crm/agent-webdesign/scripts/`
- **Documentação:** `open ~/Documents/lovable-crm/agent-webdesign/`

---

## ✅ Checklist - Dumpling Room

- [x] Website criado
- [x] Scripts preparados
- [ ] Imagens baixadas
- [ ] Website com imagens
- [ ] Testes feitos
- [ ] Publicado

---

## 🎯 Resumo

```
📂 Tudo está em:
   ~/Documents/lovable-crm/agent-webdesign/

📱 Website pronto em:
   ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/

📸 Imagens vão em:
   ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/images/

🐍 Scripts em:
   ~/Documents/lovable-crm/agent-webdesign/scripts/
```

---

## 🚀 Próximo Passo

### Escolha uma opção:

1. **Baixar imagens agora:**
   ```bash
   cd ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room
   python3 scripts/download_dumpling_images.py
   ```

2. **Fazer outro website:**
   ```bash
   # Crie nova pasta e comece!
   ```

3. **Explorar documentação:**
   ```bash
   cat ~/Documents/lovable-crm/agent-webdesign/README.md
   ```

---

**Tudo pronto! Comece agora! 🚀**

Última atualização: 2026-02-27

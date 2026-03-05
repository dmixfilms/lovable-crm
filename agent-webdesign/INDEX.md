# 📇 Index - Agent WebDesign CRM

Gerenciador centralizado de websites para leads do Lovable CRM.

**Data de Criação:** 2026-02-27
**Status:** ✅ Sistema Operacional

---

## 🗂️ Estrutura de Pastas

```
~/Documents/lovable-crm/
└── agent-webdesign/
    ├── README.md (documentação principal)
    ├── INDEX.md (este arquivo)
    ├── GUIA_DOWNLOAD_IMAGENS.md (instruções de imagens)
    │
    ├── scripts/ (reutilizáveis em todos os leads)
    │   ├── download_dumpling_images.py
    │   ├── download_google_places_images.py
    │   └── download_simple.sh
    │
    ├── templates/ (templates para novos leads)
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    │
    └── [LEADS] (cada lead tem sua pasta)
        │
        ├── Dumpling-Room/
        │   ├── README.md (info do lead)
        │   ├── images/ (fotos)
        │   ├── website/ (HTML/CSS/JS)
        │   ├── documents/ (docs relacionados)
        │   └── scripts/ (cópias dos scripts)
        │
        └── [Próximo Lead]/
            ├── README.md
            ├── images/
            ├── website/
            ├── documents/
            └── scripts/
```

---

## 📊 Leads em Desenvolvimento

| # | Lead | Tipo | Status | Website | Imagens | Data |
|---|------|------|--------|---------|---------|------|
| 1 | **Dumpling Room** | Restaurante | ✅ Ativo | ✅ Pronto | ⏳ Pendente | 2026-02-27 |

---

## 📈 Próximos Leads

### De Lovable CRM Database:

Execute para ver todos os leads:
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db \
  "SELECT id, business_name, industry_category, suburb FROM leads LIMIT 20;"
```

---

## 🚀 Quick Start - Novo Lead

### 1. Criar pasta
```bash
LEAD_NAME="Nome-Do-Lead"
mkdir -p ~/Documents/lovable-crm/agent-webdesign/$LEAD_NAME/{images,website,documents,scripts}
```

### 2. Copiar scripts
```bash
cp ~/Documents/lovable-crm/agent-webdesign/scripts/* \
   ~/Documents/lovable-crm/agent-webdesign/$LEAD_NAME/scripts/
```

### 3. Buscar no CRM
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db \
  "SELECT * FROM leads WHERE business_name LIKE '%Nome%';"
```

### 4. Criar README
```bash
# Use template de Dumpling-Room como base
cp ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/README.md \
   ~/Documents/lovable-crm/agent-webdesign/$LEAD_NAME/README.md

# Edite com informações do novo lead
```

### 5. Começar desenvolvimento
- Pesquise na internet
- Baixe imagens
- Crie o website

---

## 🔧 Scripts Disponíveis

Localização: `~/Documents/lovable-crm/agent-webdesign/scripts/`

### 1. `download_dumpling_images.py` ⭐
**Selenium - Simula navegador real**

```bash
cd ~/Documents/lovable-crm/agent-webdesign/LEAD_NAME
python3 ../scripts/download_dumpling_images.py
```

Baixa de:
- Uber Eats
- DoorDash
- Wheree
- Quandoo

**Requer:**
```bash
pip3 install selenium requests pillow
brew install chromedriver
```

### 2. `download_google_places_images.py`
**Google Places API - Oficial**

```bash
export GOOGLE_PLACES_API_KEY="sua-chave"
python3 ../scripts/download_google_places_images.py
```

**Requer:**
- API Key do Google Cloud
- Places API habilitada

### 3. `download_simple.sh`
**Shell Script - Sem dependências**

```bash
bash ../scripts/download_simple.sh
```

Usa apenas `curl` (nativo do macOS)

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Guia principal do sistema |
| `INDEX.md` | Este arquivo (índice) |
| `GUIA_DOWNLOAD_IMAGENS.md` | Tutorial completo de download de imagens |
| `Dumpling-Room/README.md` | Info específica do Dumpling Room |

---

## 💾 Backup & Sincronização

### Fazer backup de um lead
```bash
LEAD="Dumpling-Room"
tar -czf ~/backup_${LEAD}_$(date +%Y%m%d).tar.gz \
  ~/Documents/lovable-crm/agent-webdesign/$LEAD/
```

### Sincronizar com cloud (opcional)
```bash
# Se usar iCloud Drive, Dropbox, Google Drive:
ln -s ~/Documents/lovable-crm/agent-webdesign \
    ~/iCloud\ Drive/LocalFiles/agent-webdesign
```

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Leads Total** | 1 |
| **Websites Criados** | 1 |
| **Em Desenvolvimento** | 1 |
| **Imagens Baixadas** | 0 |
| **Data de Início** | 2026-02-27 |

---

## 🎯 Checklist de Novo Lead

- [ ] Pasta criada em `agent-webdesign/[LEAD]/`
- [ ] README.md preenchido com informações
- [ ] Scripts copiados para `scripts/`
- [ ] Pesquisa realizada (documentada em `documents/`)
- [ ] Imagens baixadas em `images/`
- [ ] Website criado em `website/`
- [ ] Testes de responsividade feitos
- [ ] Performance otimizada
- [ ] Publicado/Pronto para cliente

---

## 🔍 Como Encontrar Informações

### Buscar lead no CRM
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db
# Depois:
.tables
SELECT * FROM leads WHERE business_name LIKE '%termo%';
```

### Ver pasta de um lead
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room
```

### Listar todos os leads criados
```bash
ls -la ~/Documents/lovable-crm/agent-webdesign/ | grep -v "^d" | grep -v "README"
```

### Ver status de downloads
```bash
ls -la ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/images/
```

---

## 📝 Formato de Nomeação

Para manter consistência:

**Pastas de Leads:** `Nome-Com-Hífens` (sem espaços)
- ✅ `Dumpling-Room`
- ✅ `Cafe-Italiano`
- ✅ `Pizza-Express`
- ❌ `Dumpling Room` (evitar espaços)
- ❌ `dumpling_room` (preferir CamelCase)

**Arquivos:** `nome-em-minuscula.txt` ou `nomeEmCamelCase.js`
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `app.js`

**Imagens:** `plataforma_001.jpg`
- ✅ `ubereats_001.jpg`
- ✅ `doordash_002.jpg`
- ✅ `wheree_003.jpg`

---

## 🆘 Troubleshooting

### Scripts não funcionam
```bash
# Verificar se Python está instalado
python3 --version

# Verificar se Selenium está instalado
pip3 show selenium

# Verificar se ChromeDriver está instalado
which chromedriver
```

### Imagens não baixam
Veja: `GUIA_DOWNLOAD_IMAGENS.md`

### Website não abre
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/index.html
```

---

## 📅 Atualizações Recentes

- **2026-02-27**: Sistema criado
  - ✅ Pasta agent-webdesign estruturada
  - ✅ Scripts de download organizados
  - ✅ Dumpling Room website criado
  - ✅ Documentação completa

---

## 🎓 Referências Rápidas

### Abrir website do Dumpling Room
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website/index.html
```

### Abrir pasta de imagens
```bash
open ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/images/
```

### Rodar servidor local
```bash
cd ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room/website
python3 -m http.server 8080
# Abra: http://localhost:8080
```

### Baixar imagens (Selenium)
```bash
cd ~/Documents/lovable-crm/agent-webdesign/Dumpling-Room
python3 scripts/download_dumpling_images.py
```

---

## 📞 Suporte

Para questões ou problemas:
1. Consulte `README.md` (guia principal)
2. Consulte `GUIA_DOWNLOAD_IMAGENS.md` (imagens)
3. Verifique o README.md específico do lead
4. Consulte documentação online:
   - Selenium: https://selenium.dev/
   - Google Places: https://developers.google.com/maps/documentation/places
   - HTML/CSS/JS: https://developer.mozilla.org/

---

**Criado com ❤️ por Web Design Agent**
**Última atualização:** 2026-02-27

---

## 🚀 Próximos Leads Sugeridos

Execute para ver todos:
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db \
  "SELECT business_name, industry_category, suburb FROM leads LIMIT 20;"
```

Crie pastas para os próximos leads e continue o processo!

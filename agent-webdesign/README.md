# 🥟 Agent WebDesign - CRM Lead Websites

Sistema automático de criação de websites profissionais para leads do Lovable CRM.

## 📁 Estrutura de Pastas

```
agent-webdesign/
├── README.md (este arquivo)
├── GUIA_DOWNLOAD_IMAGENS.md (instruções de download)
├── scripts/ (scripts reutilizáveis)
│   ├── download_dumpling_images.py (Selenium - baixa de qualquer site)
│   ├── download_google_places_images.py (Google Places API)
│   └── download_simple.sh (Shell simples)
├── templates/ (templates para novos leads)
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── Dumpling-Room/ (pasta de cada lead)
    ├── README.md (informações do lead)
    ├── images/ (fotos do restaurante)
    ├── website/ (HTML, CSS, JS do website)
    ├── documents/ (contratos, notas, etc)
    └── scripts/ (scripts customizados para este lead)
```

## 🚀 Fluxo de Trabalho

### 1. Criar novo lead
```bash
cd ~/Documents/lovable-crm/agent-webdesign/
mkdir -p "Nome-Do-Lead/{images,website,documents,scripts}"
```

### 2. Baixar informações do CRM
```bash
# Consulte ~/Documents/lovable-crm/backend/lovable_crm.db
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db
SELECT * FROM leads WHERE business_name LIKE '%Nome%';
```

### 3. Pesquisar lead na internet
```bash
# Busque Google, Instagram, Facebook, etc
# Documente em: Nome-Do-Lead/documents/research.md
```

### 4. Baixar imagens
```bash
cd ~/Documents/lovable-crm/agent-webdesign/Nome-Do-Lead/
python3 ../scripts/download_dumpling_images.py
# As imagens vão para: ./images/
```

### 5. Criar website
```bash
# Use os scripts ou templates como base
# Edite HTML/CSS em: ./website/
```

### 6. Documentar tudo
```bash
# Crie um README.md em: Nome-Do-Lead/README.md
# Com informações, status, etc
```

## 📊 Status dos Leads

| Lead | Status | Website | Imagens | Data |
|------|--------|---------|---------|------|
| Dumpling Room | ✅ Completo | ✅ Pronto | ⏳ Pendente | 2026-02-27 |

## 🔧 Scripts Disponíveis

### `download_dumpling_images.py`
Baixa imagens usando Selenium (simula um navegador real)
```bash
python3 scripts/download_dumpling_images.py
```

**Requer:**
- Python 3.8+
- `pip3 install selenium requests`
- `brew install chromedriver`

### `download_google_places_images.py`
Baixa imagens da API Google Places (oficial)
```bash
export GOOGLE_PLACES_API_KEY="sua-chave"
python3 scripts/download_google_places_images.py
```

**Requer:**
- Google Cloud API Key
- Places API habilitada

### `download_simple.sh`
Script shell usando curl (sem dependências)
```bash
bash scripts/download_simple.sh
```

## 📝 Template README para cada Lead

Use este template para documentar cada lead:

```markdown
# [Nome do Restaurante/Negócio]

## 📋 Informações Básicas
- **Nome:**
- **Tipo:**
- **Endereço:**
- **Telefone:**
- **Website:**
- **Instagram:**

## 🎯 Status
- [ ] Pesquisa completa
- [ ] Imagens baixadas
- [ ] Website criado
- [ ] Testes feitos
- [ ] Publicado

## 🖼️ Imagens
- Total baixadas:
- Pasta: `./images/`
- Qualidade:

## 🌐 Website
- Framework: HTML5 + CSS3 + Vanilla JS
- Status: Rascunho/Completo/Publicado
- Responsivo: Sim/Não
- Performance: Ótima/Boa/Ruim

## 📁 Arquivos
- HTML: `website/index.html`
- CSS: `website/styles.css`
- JS: `website/app.js`
- Imagens: `images/`
- Documentação: `documents/`

## 💡 Notas
[Adicionar observações importantes]

## 📅 Timeline
- Criado: [data]
- Última atualização: [data]
- Publicação prevista: [data]
```

## 🔗 Links Úteis

- **Lovable CRM Database**: `~/Documents/lovable-crm/backend/lovable_crm.db`
- **Guia de Download**: `~/Documents/lovable-crm/agent-webdesign/GUIA_DOWNLOAD_IMAGENS.md`
- **Google Places API**: https://console.cloud.google.com/
- **Documentação Selenium**: https://selenium.dev/

## 👨‍💻 Como Adicionar Novo Lead

1. Encontre o lead no CRM:
```bash
sqlite3 ~/Documents/lovable-crm/backend/lovable_crm.db
SELECT business_name, address, phone, instagram_url FROM leads LIMIT 10;
```

2. Crie a pasta:
```bash
mkdir -p ~/Documents/lovable-crm/agent-webdesign/"NOME-DO-LEAD"/{images,website,documents,scripts}
```

3. Crie README.md:
```bash
# Use o template acima
```

4. Comece o workflow!

---

**Última atualização:** 2026-02-27
**Mantido por:** Web Design Agent

# 🎯 Guia - Sistema Genérico de Download de Imagens

**Para QUALQUER Lead - Não apenas Dumpling Room!**

---

## 📌 Resumo

Agora você tem um sistema profissional que funciona para **qualquer restaurante, café, negócio**.

- ✅ Um script para todos os leads
- ✅ Gerenciador centralizado
- ✅ Reutilizável infinitas vezes
- ✅ Fácil de usar

---

## 🚀 COMECE RÁPIDO

### 1️⃣ Criar novo lead

```bash
python3 ~/Documents/lovable-crm/agent-webdesign/scripts/manage_leads.py --create "Cafe-Italiano"
```

Vai criar automaticamente:
```
Cafe-Italiano/
├── images/ ................. (fotos)
├── website/ ................ (site)
├── documents/ .............. (pesquisa)
├── scripts/ ................ (download scripts)
└── README.md ............... (documentação)
```

### 2️⃣ Baixar imagens (com URLs)

```bash
python3 manage_leads.py --download "Cafe-Italiano" \
  --url "https://www.ubereats.com/sua-url" \
  --url "https://www.instagram.com/seu_cafe"
```

### 3️⃣ Verificar status

```bash
python3 manage_leads.py --list
```

---

## 📚 USO COMPLETO

### Criar Lead com Informações

```bash
python3 manage_leads.py --create "Pizza-Express" \
  --info '{"type": "restaurant", "location": "Sydney", "phone": "02-1234-5678"}'
```

### Download com Termos Customizados

```bash
python3 manage_leads.py --download "Pizza-Express" \
  --url "https://www.doordash.com/pizza-express" \
  --search "pizza" \
  --search "pasta" \
  --search "carbonara"
```

### Atualizar Status

```bash
python3 manage_leads.py --status "Pizza-Express" "completed"
```

Status disponíveis:
- `new` - Novo lead
- `in_progress` - Em desenvolvimento
- `completed` - Completo
- `published` - Publicado

---

## 🎯 WORKFLOW COMPLETO

### Passo 1: Pesquisar o negócio
```bash
# Procure na internet:
# - Google
# - Uber Eats
# - DoorDash
# - Instagram
# - TripAdvisor
# - Website próprio
```

### Passo 2: Criar pasta do lead
```bash
python3 manage_leads.py --create "Nome-Do-Lead"
```

### Passo 3: Adicionar informações
```bash
# Edite: ~/Documents/lovable-crm/agent-webdesign/Nome-Do-Lead/README.md
# Adicione:
# - Endereço
# - Telefone
# - Website
# - Instagram
# - Descrição
```

### Passo 4: Documentar pesquisa
```bash
# Crie arquivo: ~/Documents/lovable-crm/agent-webdesign/Nome-Do-Lead/documents/research.md
# Cole informações importantes
```

### Passo 5: Baixar imagens
```bash
python3 manage_leads.py --download "Nome-Do-Lead" \
  --url "url1" \
  --url "url2" \
  --url "url3"
```

### Passo 6: Criar/customizar website
```bash
# Copie template ou crie novo em:
# ~/Documents/lovable-crm/agent-webdesign/Nome-Do-Lead/website/
```

### Passo 7: Integrar imagens
```bash
# Edite HTML/CSS para incluir as imagens
# Otimize performance
```

### Passo 8: Publicar
```bash
# Atualizar status
python3 manage_leads.py --status "Nome-Do-Lead" "published"

# Fazer backup
tar -czf ~/backup_nome_$(date +%Y%m%d).tar.gz ~/Documents/lovable-crm/agent-webdesign/Nome-Do-Lead/
```

---

## 📖 EXEMPLOS PRÁTICOS

### Exemplo 1: Novo Café

```bash
# 1. Criar
python3 manage_leads.py --create "Cafe-Artesanal"

# 2. Adicionar URLs
python3 manage_leads.py --download "Cafe-Artesanal" \
  --url "https://www.ubereats.com/en-AU/store/artesanal-cafe" \
  --url "https://www.instagram.com/cafe.artesanal" \
  --search "coffee" \
  --search "latte" \
  --search "cappuccino"

# 3. Ver status
python3 manage_leads.py --list
```

### Exemplo 2: Restaurante Francês

```bash
# 1. Criar
python3 manage_leads.py --create "Restaurant-Francais"

# 2. Adicionar múltiplas URLs
python3 manage_leads.py --download "Restaurant-Francais" \
  --url "https://www.doordash.com/restaurant-francais" \
  --url "https://www.tripadvisor.com/restaurant-francais" \
  --url "https://maps.google.com/?q=restaurant+francais+sydney" \
  --search "french" \
  --search "cuisine" \
  --search "wine"

# 3. Atualizar status
python3 manage_leads.py --status "Restaurant-Francais" "in_progress"
```

### Exemplo 3: Padaria

```bash
# 1. Criar
python3 manage_leads.py --create "Padaria-Artesanal"

# 2. Download com termos customizados
python3 manage_leads.py --download "Padaria-Artesanal" \
  --url "https://www.ubereats.com/padaria-artesanal" \
  --url "https://www.instagram.com/padaria.artesanal" \
  --search "bread" \
  --search "pastry" \
  --search "boulangerie" \
  --search "croissant"

# 3. Listar todos
python3 manage_leads.py --list
```

---

## 🔧 SCRIPTS DISPONÍVEIS

### `manage_leads.py` - Gerenciador Central
```bash
python3 manage_leads.py --create "Nome"        # Criar lead
python3 manage_leads.py --list                 # Listar leads
python3 manage_leads.py --download "Nome" --url "..." # Baixar
python3 manage_leads.py --status "Nome" "status"       # Atualizar
```

### `download_images_generic.py` - Download Direto
```bash
python3 download_images_generic.py "Nome-Do-Lead"
python3 download_images_generic.py "Nome" --url "https://..."
python3 download_images_generic.py "Nome" --search "termo1" --search "termo2"
```

### `download_google_places_images.py` - Google API
```bash
export GOOGLE_PLACES_API_KEY="sua-chave"
python3 download_google_places_images.py
```

### `download_simple.sh` - Shell Script
```bash
bash download_simple.sh
```

---

## 📊 Estrutura de Leads

```
~/Documents/lovable-crm/agent-webdesign/
│
├── Dumpling-Room/
│   ├── images/ ...................... (fotos baixadas)
│   ├── website/ ..................... (site HTML/CSS/JS)
│   ├── documents/ ................... (pesquisa)
│   ├── scripts/ ..................... (cópias dos scripts)
│   └── README.md .................... (info do lead)
│
├── Cafe-Italiano/
│   ├── images/
│   ├── website/
│   ├── documents/
│   ├── scripts/
│   └── README.md
│
├── Pizza-Express/
│   ├── images/
│   ├── website/
│   ├── documents/
│   ├── scripts/
│   └── README.md
│
└── [Infinitos mais leads...]
```

---

## 🎯 Arquivo leads.json

Rastreia todos os leads:

```json
{
  "Dumpling-Room": {
    "created_at": "2026-02-27T10:30:00",
    "status": "completed",
    "path": "Documents/lovable-crm/agent-webdesign/Dumpling-Room",
    "info": {}
  },
  "Cafe-Italiano": {
    "created_at": "2026-02-27T11:00:00",
    "status": "new",
    "path": "Documents/lovable-crm/agent-webdesign/Cafe-Italiano",
    "info": {}
  }
}
```

---

## 💡 Dicas Profissionais

### 1. Organizar por Categoria
```bash
# Em documents/research.md
# Tipo: Restaurante
# Categoria: Culinária Italiana
# Preço: $$
# Horário: 11:30-23:00
```

### 2. Otimizar Imagens
```bash
# Depois de baixar, comprimir:
cd ~/Documents/lovable-crm/agent-webdesign/Nome/images
mogrify -quality 85 -resize 1200x1200 *.jpg
```

### 3. Gerar Thumbnails
```bash
# Para carregamento mais rápido:
for img in *.jpg; do
  convert "$img" -resize 400x400 "${img%.jpg}_thumb.jpg"
done
```

### 4. Backup Automático
```bash
# Fazer backup de um lead
tar -czf ~/backup_$(date +%Y%m%d)_Nome.tar.gz \
  ~/Documents/lovable-crm/agent-webdesign/Nome/
```

### 5. Sincronizar com Cloud (opcional)
```bash
# ICloud Drive
ln -s ~/Documents/lovable-crm/agent-webdesign \
    ~/iCloud\ Drive/LocalFiles/agent-webdesign

# Dropbox
ln -s ~/Documents/lovable-crm/agent-webdesign \
    ~/Dropbox/Projects/agent-webdesign
```

---

## 🚨 Troubleshooting

### ❓ Script não encontra o lead
```bash
# Verifique se existe:
ls ~/Documents/lovable-crm/agent-webdesign/

# Se não, crie:
python3 manage_leads.py --create "Nome"
```

### ❓ Nenhuma imagem foi baixada
```bash
# Tente com URLs específicas:
python3 manage_leads.py --download "Nome" --url "https://..."

# Ou tente termos de busca:
python3 manage_leads.py --download "Nome" --search "food" --search "menu"
```

### ❓ Chrome não inicia
```bash
# Reinstale ChromeDriver:
brew install --cask chromedriver

# Ou tente sem Chrome (Google API):
python3 download_google_places_images.py
```

### ❓ Erro de permissão
```bash
# Corrija permissões:
chmod -R 755 ~/Documents/lovable-crm/agent-webdesign/
```

---

## 📞 Suporte Rápido

**Local dos scripts:**
```
~/Documents/lovable-crm/agent-webdesign/scripts/
```

**Configuração:**
```
~/Documents/lovable-crm/agent-webdesign/leads.json
```

**Documentação:**
```
~/Documents/lovable-crm/agent-webdesign/*.md
```

---

## ✨ Próximos Leads

Crie websites para:

1. 🍕 Pizza-Express
2. ☕ Cafe-Artesanal
3. 🍔 Burger-House
4. 🍜 Noodle-Bar
5. 🥗 Salad-Kitchen
6. 🍰 Cake-Studio
7. 🍱 Sushi-Place
8. 🥩 Steakhouse
9. 🌮 Taco-Fiesta
10. 🍝 Pasta-Italiana

---

**Tudo está pronto! Comece a criar websites agora! 🚀**

Última atualização: 2026-02-27

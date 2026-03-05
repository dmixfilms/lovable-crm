# 🥟 Guia: Download de Imagens do Dumpling Room

## 📋 Duas Opções Disponíveis

### ✨ Opção 1: Selenium (RECOMENDADO - Mais Fácil)
Usa um navegador real para simular um usuário e baixar as imagens dos sites.

**Vantagens:**
- ✅ Funciona com qualquer site
- ✅ Contorna proteções simples
- ✅ Baixa imagens reais dos cardápios
- ✅ Rápido e confiável

**Desvantagens:**
- ⚠️ Alguns sites podem bloquear

---

### 💰 Opção 2: Google Places API (Mais Confiável)
Usa a API oficial do Google para buscar fotos certificadas.

**Vantagens:**
- ✅ Método oficial do Google
- ✅ Fotos de alta qualidade
- ✅ 100% legal

**Desvantagens:**
- ⚠️ Requer criar API Key (gratuito)
- ⚠️ Pouquinhas fotos (geralmente 10-20)

---

## 🚀 INSTALAÇÃO - Opção 1 (Selenium)

### Passo 1: Instalar dependências

```bash
pip3 install selenium requests pillow
```

### Passo 2: Instalar ChromeDriver

```bash
# No Mac:
brew install chromedriver

# No Linux:
sudo apt-get install chromium-chromedriver

# No Windows:
# Baixe em: https://chromedriver.chromium.org/
# E adicione ao PATH
```

### Passo 3: Executar o script

```bash
cd ~
python3 download_dumpling_images.py
```

**O que vai acontecer:**
1. Abre um navegador Chrome automaticamente
2. Visita Uber Eats, DoorDash, Wheree, Quandoo
3. Scroll através das páginas
4. Baixa as imagens automaticamente
5. Salva em: `~/Documents/dumpling-room-website/images/`

---

## 🔑 INSTALAÇÃO - Opção 2 (Google Places API)

### Passo 1: Criar API Key

1. Vá para: https://console.cloud.google.com/
2. Crie um novo projeto (botão "Novo Projeto")
3. Procure por "Places API" na barra de busca
4. Clique em "Places API" > "Ativar"
5. Procure por "Maps JavaScript API" > "Ativar"
6. Vá em "Credenciais" (menu esquerdo)
7. Clique "Criar credencial" > "Chave de API"
8. Copie a chave (vai ser algo como `AIzaSy...`)

### Passo 2: Configurar variável de ambiente

```bash
# Abra o terminal e adicione ao ~/.zshrc (ou ~/.bashrc):
echo 'export GOOGLE_PLACES_API_KEY="sua-chave-aqui"' >> ~/.zshrc

# Substitua "sua-chave-aqui" pela chave do Google

# Recarregue o shell:
source ~/.zshrc
```

### Passo 3: Executar

```bash
python3 download_google_places_images.py
```

---

## 📁 Onde as Imagens Ficam

Todos os scripts salvam em:
```
~/Documents/dumpling-room-website/images/
```

Você pode acessar assim:
```bash
open ~/Documents/dumpling-room-website/images/
```

---

## 🎯 Próximos Passos (Após baixar as imagens)

### 1. Integrar no Website

Coloque as imagens na pasta `images/` e atualize o HTML:

```html
<!-- No hero section -->
<img src="images/ubereats_001.jpg" alt="Dumplings">

<!-- Na galeria -->
<div class="gallery">
  <img src="images/doordash_002.jpg" alt="Ramen">
  <img src="images/wheree_003.jpg" alt="Noodles">
</div>
```

### 2. Otimizar Imagens

Se as imagens forem grandes, comprima:

```bash
# Instalar ImageMagick:
brew install imagemagick

# Comprimir (reduz 80% do tamanho):
mogrify -quality 85 -resize 1200x1200 ~/Documents/dumpling-room-website/images/*.jpg
```

### 3. Gerar Thumbnail

```bash
# Cria versões menores para carregamento rápido:
for img in ~/Documents/dumpling-room-website/images/*.jpg; do
  convert "$img" -resize 400x400 "${img%.jpg}_thumb.jpg"
done
```

---

## ⚠️ Troubleshooting

### Erro: "chromedriver not found"

```bash
# Mac:
which chromedriver  # deve retornar /usr/local/bin/chromedriver

# Se não estiver instalado:
brew install chromedriver
```

### Erro: "Chrome crashed"

Tente com headless mode (sem janela). Edit o script e descomente:
```python
# chrome_options.add_argument("--headless")
```

### Nenhuma imagem foi baixada

1. Alguns sites podem bloquear
2. Tente manualmente:
   - Abra: https://www.ubereats.com/au/store/dumpling-room/U_jq1aO0QBaU9hpbsNCVpQ
   - Clique direito nas imagens > "Salvar imagem como"
   - Salve em: `~/Documents/dumpling-room-website/images/`

### Erro de API Key (Google Places)

Verifique se:
1. A API Key está correta
2. Fez `source ~/.zshrc` após adicionar
3. Places API está habilitada no console Google
4. Tem saldo na conta Google (primeiros $200 são grátis)

---

## 💡 Dicas Extras

### Criar pasta de backup
```bash
cp -r ~/Documents/dumpling-room-website/images ~/dumpling_images_backup
```

### Ver quantas imagens foram baixadas
```bash
ls -lah ~/Documents/dumpling-room-website/images/ | wc -l
```

### Abrir pasta no Finder
```bash
open ~/Documents/dumpling-room-website/images/
```

---

## 🎨 Próximo: Integrar no Website

Uma vez com as imagens, vou:
1. ✅ Adicionar ao HTML do website
2. ✅ Otimizar com lazy loading
3. ✅ Criar galeria interativa
4. ✅ Adicionar ao menu

**Quer que eu faça isso agora?**

---

**Criado em:** 2026-02-27
**Status:** ✅ Pronto para usar

# 🤖 Smart Image Scraper - DMIX Media Works 2026

## O que é?

Sistema automático que busca e baixa imagens de **ALTA QUALIDADE** de múltiplas fontes simultaneamente:

✅ **Google Images** - Busca de imagens gerais
✅ **Unsplash** - Fotos de alta qualidade (API)
✅ **Pexels** - Acervo profissional
✅ **Pixabay** - Imagens livres de direitos

---

## Como Usar

### Básico:
```bash
python3 smart_image_scraper.py "Nome-Do-Lead" "tipo-de-comida"
```

### Exemplos:

**Dumpling Room:**
```bash
python3 smart_image_scraper.py "Dumpling-Room" "dumplings"
```

**Pizza Express:**
```bash
python3 smart_image_scraper.py "Pizza-Express" "pizza"
```

**Café Italiano:**
```bash
python3 smart_image_scraper.py "Cafe-Italiano" "coffee"
```

**Noodle Bar:**
```bash
python3 smart_image_scraper.py "Noodle-Bar" "noodles"
```

---

## O que o Scraper Faz

1. **Abre Chrome automaticamente** - Navega por cada site
2. **Busca imagens** - Procura por "dumplings", "pizza", etc.
3. **Valida resolução** - Só baixa imagens ≥1000x600px
4. **Verifica qualidade** - Só aceita imagens válidas
5. **Organiza resultado** - Salva em `lead-name/images/`

---

## Estrutura de Saída

```
Dumpling-Room/images/
├── unsplash_dumplings_1.jpg
├── unsplash_dumplings_2.jpg
├── pexels_dumplings_1.jpg
├── pixabay_dumplings_1.jpg
├── google_dumplings_1.jpg
└── ... (mais imagens)
```

---

## Filtros e Validações

✅ **Resolução mínima:** 1000x600px
✅ **Formato:** JPG/PNG apenas
✅ **Duplicatas:** Não baixa mesmas imagens
✅ **Timeout:** 15 segundos por imagem
✅ **User-Agent:** Mozilla/5.0 (não é bot)

---

## Performance

| Fonte | Tempo | Imagens | Qualidade |
|-------|-------|---------|-----------|
| Unsplash API | ~3s | 5-10 | ⭐⭐⭐⭐⭐ |
| Pexels | ~5s | 3-5 | ⭐⭐⭐⭐⭐ |
| Pixabay | ~5s | 3-5 | ⭐⭐⭐⭐ |
| Google Images | ~10s | 5-8 | ⭐⭐⭐ |

**Total: ~20-30 segundos para todas as fontes**

---

## Próximas Funcionalidades

- [ ] Salvar URLs ao invés de baixar (economizar espaço)
- [ ] Auto-selecionar melhor imagem para hero
- [ ] Classificar por cor (match com brand palette)
- [ ] Cache de buscas (não buscar mesma coisa 2x)
- [ ] Integração com MongoDB para histórico

---

## Troubleshooting

### Chrome não abre
```bash
# Instalar ChromeDriver
brew install chromedriver

# Ou usar driver que vem com Selenium
```

### Rate limiting
Se receber "Too many requests":
- Aguardar 1 hora
- Ou mudar para VPN
- Scraper já tem delay de 1s entre requisições

### Imagens não baixam
- Verificar conexão de internet
- Confirmar que lead folder existe
- Aumentar timeout em `download_image()` (padrão: 15s)

---

## Integrando com Website

Após baixar imagens, use as melhores no hero:

```html
<!-- No index.html, substituir URL Unsplash -->
<img class="hero__bg-image"
     src="../images/unsplash_dumplings_1.jpg"
     alt="Dumplings"
     loading="eager">
```

---

**Versão:** 1.0
**Status:** ✅ Pronto para produção
**Autor:** DMIX Media Works

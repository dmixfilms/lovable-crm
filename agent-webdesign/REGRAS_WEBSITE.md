# 📋 REGRAS PADRÃO PARA TODOS OS WEBSITES

**Status:** ✅ Implementado no Dumpling Room
**Objetivo:** Padronização profissional para TODOS os leads

---

## 🎨 REGRA 1: HEADER COM IMAGEM

### Requisitos:
✅ **Obrigatório:** Imagem de alta qualidade no hero section
✅ **Tamanho:** Pelo menos 800x600px
✅ **Posicionamento:** Background com overlay
✅ **Opacity:** 0.6-0.8 (deixa conteúdo legível)
✅ **Fallback:** CSS gradients como backup

### Implementação:
```html
<!-- Hero com imagem -->
<section class="hero" id="hero">
  <img class="hero__bg-image" src="../images/high-quality.jpg" alt="Hero Image" loading="eager">
  <!-- Conteúdo do hero aqui -->
</section>
```

### CSS:
```css
.hero__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.7;
  z-index: 0;
}
```

---

## 🔐 REGRA 2: FOOTER PROFISSIONAL

### Requisitos Obrigatórios:
✅ Preservar TODO conteúdo original
✅ Assinatura DMIX Media Works 2026
✅ Countdown Timer (7 dias)
✅ Aviso de Approval
✅ Informações de contato original

### Estrutura HTML:
```html
<footer class="footer">
  <!-- Original footer content -->
  <div class="footer__top">
    <!-- ... conteúdo original ... -->
  </div>

  <!-- Footer melhorado -->
  <div class="footer__bottom">
    <div class="container">
      <div class="footer__bottom-content">

        <!-- 1. Conteúdo Original -->
        <div class="footer__original">
          <p>&copy; 2026 [Business Name]. All rights reserved.</p>
          <p>[Tagline]</p>
        </div>

        <!-- 2. Assinatura DMIX -->
        <div class="footer__dmix">
          <p class="footer__signature">
            Concept redesigned by <strong>DMIX Media Works</strong> 2026 - Not affiliated. Private Proposal.
          </p>
        </div>

        <!-- 3. Countdown + Approval -->
        <div class="footer__approval">
          <div class="footer__countdown">
            <span class="countdown-icon">⏰</span>
            <span id="countdownTimer">This preview expires in 7 days</span>
          </div>
          <p class="footer__approval-text">Approval required to proceed with full deployment</p>
        </div>

      </div>
    </div>
  </div>
</footer>
```

### CSS (Template):
```css
.footer__bottom-content {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  align-items: center;
}

.footer__dmix {
  text-align: center;
  padding: var(--space-sm) var(--space-md);
  background: rgba(212,175,55,0.05);
  border-left: 2px solid rgba(212,175,55,0.3);
  border-radius: 4px;
}

.footer__signature {
  font-size: 0.78rem;
  color: rgba(212,175,55,0.8);
  margin: 0;
  font-weight: 500;
}

.footer__countdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: rgba(196,30,58,0.8);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.countdown-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

### JavaScript (Template):
```javascript
function initCountdownTimer() {
  const timerElement = document.getElementById('countdownTimer');
  if (!timerElement) return;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  const updateTimer = () => {
    const now = new Date();
    const diff = expirationDate - now;

    if (diff <= 0) {
      timerElement.textContent = 'This preview has expired';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      timerElement.textContent = `This preview expires in ${days}d ${hours}h`;
    } else if (hours > 0) {
      timerElement.textContent = `This preview expires in ${hours}h ${minutes}m`;
    } else {
      timerElement.textContent = `This preview expires in ${minutes}m`;
    }
  };

  updateTimer();
  setInterval(updateTimer, 60000);
}

// Chamar na função init()
initCountdownTimer();
```

---

## 🎯 CHECKLIST PARA NOVOS WEBSITES

Ao criar website para novo lead, verificar:

- [ ] **HEADER**: Imagem de alta qualidade adicionada
- [ ] **HERO**: Background image `src="../images/qualidade-alta.jpg"`
- [ ] **FOOTER**: Conteúdo original preservado
- [ ] **DMIX**: Assinatura adicionada corretamente
- [ ] **COUNTDOWN**: Timer de 7 dias funcionando
- [ ] **APPROVAL**: Mensagem "Approval required" visível
- [ ] **CSS**: Estilos do footer aplicados
- [ ] **JS**: Função `initCountdownTimer()` chamada
- [ ] **MOBILE**: Footer responsivo em mobile

---

## 📸 DICAS PARA IMAGENS DO HEADER

### Onde encontrar boas imagens:
1. **Do próprio negócio** - Fotos reais dos pratos/produtos
2. **Imagens baixadas** - De Uber Eats, Instagram, DoorDash (melhor qualidade)
3. **Critérios:**
   - Mínimo 1200x800px
   - Relevante ao negócio
   - Bem iluminada
   - Profissional

### Implementação:
```bash
# 1. Usar imagens baixadas de alta qualidade
# Geralmente encontradas em: images/wheree_*.jpg (são maiores)

# 2. No HTML:
<img class="hero__bg-image" src="../images/wheree_043.jpg" alt="Hero">

# 3. No CSS, ajustar opacity conforme necessário:
.hero__bg-image { opacity: 0.6; } /* Ajuste para legibilidade */
```

---

## 🔄 EXEMPLO COMPLETO: DUMPLING ROOM

**Status:** ✅ IMPLEMENTADO

### Header:
```html
<img class="hero__bg-image" src="../images/wheree_043.jpg" alt="Dumpling Room Hero">
```

### Footer:
```
Concept redesigned by DMIX Media Works 2026 - Not affiliated. Private Proposal.
⏰ This preview expires in 7 days (countdown em tempo real)
Approval required to proceed with full deployment
```

### Visual:
```
┌─────────────────────────────────┐
│                                 │
│     HERO COM IMAGEM             │
│  (Dumpling Room alta qualidade) │
│                                 │
└─────────────────────────────────┘

... conteúdo do site ...

┌──────────┬──────────┬──────────┐
│ Original │  DMIX    │Countdown │
│ Footer   │ Signature│ + Approval│
└──────────┴──────────┴──────────┘
```

---

## 🚀 PRÓXIMOS WEBSITES

Quando criar novos websites para:

1. **Pizza-Express** - Usar imagens de pizza de alta qualidade
2. **Cafe-Italiano** - Usar imagens de café/cappuccino
3. **Noodle-Bar** - Usar imagens de pratos de noodles
4. [Continuar padrão...]

**Sempre aplicar:** HEADER image + FOOTER profissional

---

## ⚠️ IMPORTANTE

✅ **Essas regras são OBRIGATÓRIAS para todos os websites**
✅ **Garantem profissionalismo e padronização**
✅ **Descrevem crédito ao DMIX Media Works**
✅ **Indicam claramente que é uma proposta privada**
✅ **7 dias de preview cria urgência**

---

**Versão:** 1.0
**Data:** 2026-02-27
**Status:** ✅ Ativo e Implementado

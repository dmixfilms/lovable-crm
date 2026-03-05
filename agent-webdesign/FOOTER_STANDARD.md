# 🏢 FOOTER PADRÃO DMIX MEDIA WORKS - 2026

## Objetivo
Criar um footer consistente, profissional e escalável para TODOS os websites que vamos criar.

---

## 📐 ESTRUTURA HTML PADRÃO

### Seção "Visit Us" (já implementada em Dumpling Room)
```html
<section class="hours-section section" id="hours">
  <div class="container">
    <div class="hours-grid">

      <!-- COLUNA ESQUERDA: INFORMAÇÕES -->
      <div class="hours-info reveal-left">
        <span class="section-tag">Visit Us</span>
        <h2 class="section-title">Hours &<br>Location</h2>

        <!-- Endereço -->
        <address class="hours-address">
          <div class="hours-address__item">
            <svg><!-- ícone de localização --></svg>
            <span>[ENDERECO COMPLETO]</span>
          </div>
          <div class="hours-address__item">
            <svg><!-- ícone de telefone --></svg>
            <a href="tel:[PHONE]">[PHONE]</a>
          </div>
        </address>

        <!-- Horários -->
        <div class="hours-table">
          <div class="hours-row">
            <span class="hours-day">[DIA]</span>
            <span class="hours-time">[HORÁRIO]</span>
          </div>
          <!-- ... mais linhas ... -->
        </div>

        <!-- Delivery Apps -->
        <div class="hours-delivery">
          <p class="hours-delivery__label">Order Delivery Via</p>
          <div class="hours-delivery__apps">
            <a href="[DOORDASH-URL]" class="delivery-btn">DoorDash</a>
            <a href="[UBEREATS-URL]" class="delivery-btn">Uber Eats</a>
          </div>
        </div>
      </div>

      <!-- COLUNA DIREITA: MAPA GRANDE -->
      <div class="hours-map reveal-right">
        <iframe
          src="[GOOGLE-MAPS-EMBED]"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy">
        </iframe>
        <div class="map-overlay">
          <a href="[GET-DIRECTIONS-URL]" class="map-cta">
            Get Directions
          </a>
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## 🔗 FOOTER PADRÃO

### HTML Structure
```html
<footer class="footer">

  <!-- FOOTER TOP: 4 COLUNAS -->
  <div class="footer__top">
    <div class="container">
      <div class="footer__grid">

        <!-- COLUNA 1: BRAND -->
        <div class="footer__brand">
          <a href="#hero" class="logo logo--light">
            <span class="logo__text">
              <span class="logo__name">[NEGOCIO NOME]</span>
              <span class="logo__tagline">[TAGLINE]</span>
            </span>
          </a>
          <p class="footer__desc">[DESCRICAO CURTA]</p>

          <div class="footer__social">
            <a href="[INSTAGRAM]" target="_blank"><svg>Instagram</svg></a>
            <a href="[FACEBOOK]" target="_blank"><svg>Facebook</svg></a>
          </div>
        </div>

        <!-- COLUNA 2: NAVEGAÇÃO -->
        <nav class="footer__nav">
          <h4 class="footer__nav-title">Navigate</h4>
          <ul>
            <li><a href="#about">Our Story</a></li>
            <li><a href="#specialties">Specialties</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#hours">Location</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <!-- COLUNA 3: HORÁRIOS -->
        <div class="footer__hours">
          <h4 class="footer__nav-title">Hours</h4>
          <ul>
            <li><span>Mon – Sun</span><span>[HORARIO]</span></li>
            <li><span>Holidays</span><span>[HORARIO]</span></li>
          </ul>
        </div>

        <!-- COLUNA 4: CONTATO -->
        <div class="footer__contact">
          <h4 class="footer__nav-title">Contact</h4>
          <ul>
            <li>
              <svg>📍</svg>
              [ENDERECO]
            </li>
            <li>
              <svg>📞</svg>
              <a href="tel:[PHONE]">[PHONE]</a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>

  <!-- FOOTER BOTTOM: ASSINATURA + COUNTDOWN -->
  <div class="footer__bottom">
    <div class="container">
      <div class="footer__bottom-content">

        <!-- ORIGINAL BUSINESS INFO -->
        <div class="footer__original">
          <p>&copy; 2026 [NEGOCIO]. All rights reserved.</p>
        </div>

        <!-- DMIX SIGNATURE -->
        <div class="footer__dmix">
          <p class="footer__signature">
            Concept redesigned by <strong>DMIX Media Works</strong> 2026 -
            Not affiliated. Private Proposal.
          </p>
        </div>

        <!-- COUNTDOWN TIMER -->
        <div class="footer__approval">
          <div class="footer__countdown">
            <span class="countdown-icon">⏰</span>
            <span id="countdownTimer">This preview expires in 7 days</span>
          </div>
          <p class="footer__approval-text">Approval required to proceed</p>
        </div>

      </div>
    </div>
  </div>

</footer>
```

---

## 🎨 CSS PADRÃO

### Grid Layout (4 Colunas)
```css
.footer__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2xl);
  margin-bottom: var(--space-3xl);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
}
```

### Brand Column
```css
.footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.footer__desc {
  font-size: 0.9rem;
  color: rgba(253,248,240,0.6);
  line-height: 1.6;
}

.footer__social {
  display: flex;
  gap: var(--space-sm);
}

.footer__social a {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(212,175,55,0.1);
  color: var(--gold);
  transition: all var(--transition-mid);
}

.footer__social a:hover {
  background: var(--gold);
  color: var(--ink);
}
```

### Navigation / Hours / Contact
```css
.footer__nav, .footer__hours, .footer__contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.footer__nav-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--parchment);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.footer__nav ul, .footer__hours ul, .footer__contact ul {
  list-style: none;
}

.footer__nav a, .footer__hours span, .footer__contact span {
  font-size: 0.85rem;
  color: rgba(253,248,240,0.7);
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.footer__nav a:hover {
  color: var(--gold);
}
```

### Bottom Section
```css
.footer__bottom-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  padding-top: var(--space-2xl);
  border-top: 1px solid rgba(212,175,55,0.1);
}

.footer__dmix {
  text-align: center;
  padding: var(--space-md);
  background: rgba(212,175,55,0.05);
  border-left: 2px solid rgba(212,175,55,0.3);
  border-radius: 4px;
}

.footer__signature {
  font-size: 0.75rem;
  color: rgba(212,175,55,0.8);
}

.footer__countdown {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8rem;
  color: rgba(196,30,58,0.8);
  font-weight: 600;
}

.countdown-icon {
  animation: pulse 2s ease-in-out infinite;
}

@responsive
@media (max-width: 768px) {
  .footer__bottom-content {
    grid-template-columns: 1fr;
  }
}
```

---

## 🗺️ SEÇÃO "VISIT US" - PADRÃO

**Layout:** Info esquerda (40%) + Mapa direita (60%)

### Checklist
- [ ] Google Maps embed com localização correta
- [ ] Botão "Get Directions" funcional
- [ ] Horários de funcionamento completos
- [ ] Telefone clicável (tel: link)
- [ ] Apps de delivery (DoorDash, Uber Eats) com links diretos
- [ ] Responsivo: em mobile, mapa em baixo

---

## 🚀 IMPLEMENTAÇÃO PARA NOVOS LEADS

### Passo 1: Coletar Informações
```
Negócio: [NOME]
Tagline: [FRASE CURTA]
Descrição: [2-3 linhas]
Endereço: [COMPLETO]
Telefone: [COM DDD]
Horários: [SEG-DOM]
Instagram: [URL]
Facebook: [URL]
DoorDash: [URL]
Uber Eats: [URL]
Google Maps: [EMBED CODE]
```

### Passo 2: Parametrizar HTML
Replace all `[NEGOCIO NOME]`, `[PHONE]`, etc. com dados coletados

### Passo 3: Testar
- [ ] Links funcionam
- [ ] Mapa carrega
- [ ] Responsivo em mobile
- [ ] Countdown timer funciona

---

## 📊 CORES & ESTILO

| Elemento | Cor | Opacity |
|----------|-----|---------|
| Text principal | #FDF8F0 (parchment) | 1.0 |
| Text secundário | rgba(253,248,240,0.7) | 0.7 |
| Ícones/Links | #D4AF37 (gold) | - |
| Backgrounds hover | rgba(212,175,55,0.1) | 0.1 |
| Border | rgba(212,175,55,0.1) | 0.1 |

---

## 🎯 STATUS

✅ **Implementado em:** Dumpling Room
⏳ **Próximos:** Pizza-Express, Café-Italiano, Noodle-Bar, etc.

**Versão:** 1.0
**Data:** 2026-02-27
**Autor:** DMIX Media Works
